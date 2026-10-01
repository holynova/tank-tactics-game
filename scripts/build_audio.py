"""Create original layered game sound samples. No third-party recordings are used."""
from pathlib import Path
from array import array
import math, random, wave, json, subprocess

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'public'/'audio'
RAW=ROOT/'source-audio'
OUT.mkdir(parents=True,exist_ok=True)
RAW.mkdir(parents=True,exist_ok=True)
RATE=24000
PI=math.pi
rng=random.Random(17031)
DURATIONS={'click':.085,'dice':.14,'turn':.28,'turret-land':.30,'turret-sea':.36,
'motor-land':.90,'motor-sea':.90,'fire-land':.64,'fire-sea':.80,'explode-land':1.15,
'explode-sea':1.15,'win':1.65,'lose':1.8,'ambient-land':8.0,'ambient-sea':8.0}
report=[]

def env(t,d,attack=.01):
    return min(1,t/attack)*min(1,(d-t)/.04)
def tone(freq,t):
    return math.sin(2*PI*freq*t)
def burst(t,at,decay,freq):
    u=t-at
    return (tone(freq,u)*math.exp(-u/decay)) if u>=0 else 0
def echo(data,delay,gain):
    samples=int(delay*RATE)
    source=list(data)
    for i in range(samples,len(data)):
        data[i]+=gain*source[i-samples]

for name,d in DURATIONS.items():
    data=[]
    low=0.0; mid=0.0; phase=0.0
    for i in range(int(d*RATE)):
        t=i/RATE
        white=rng.uniform(-1,1)
        low+=.025*(white-low)
        mid+=.22*(white-mid)
        if name=='click':
            s=.22*tone(1500,t)*math.exp(-t/0.018)+.1*white*math.exp(-t/.006)
        elif name=='dice':
            s=sum(.18*burst(t,a,.017,440+180*k) for k,a in enumerate([0,.038,.085]))
            s+=white*.10*sum(math.exp(-(t-a)/.009) for a in [0,.038,.085] if t>=a)
        elif name=='turn':
            s=.16*burst(t,0,.10,660)+.14*burst(t,.075,.13,880)
        elif name.startswith('motor'):
            progress=t/d
            freq=(34+29*math.sin(PI*progress)**.7) if name.endswith('land') else (42+18*math.sin(PI*progress))
            phase+=2*PI*freq/RATE
            core=sum(math.sin(phase*k)*(.16/k) for k in range(1,6))
            if name.endswith('land'):
                tread=max(0,tone(19,t))**12
                s=core*(.8+.18*tone(12,t))+.16*low+.16*mid*tread
            else:
                s=core*.65+.18*mid*(.6+.3*tone(7,t))+.08*low
            s*=math.sin(PI*progress)**.35
        elif name.startswith('turret'):
            s=.06*(tone(190,t)+tone(383,t))+.08*mid
            s+=.12*burst(t,0,.016,1100)+.10*burst(t,d-.06,.018,750)
        elif name.startswith('fire'):
            naval=name.endswith('sea')
            freq=36+(90 if not naval else 64)*math.exp(-t/0.03)
            phase+=2*PI*freq/RATE
            bass=.42*math.sin(phase)*math.exp(-t/(.13 if not naval else .2))
            crack=.28*(white-mid)*math.exp(-t/.022)
            airflow=.22*mid*math.exp(-t/.16)
            s=bass+crack+airflow
        elif name.startswith('explode'):
            sea=name.endswith('sea')
            phase+=2*PI*(26+32*math.exp(-t/.18))/RATE
            s=.42*math.sin(phase)*math.exp(-t/.28)+.55*low*math.exp(-t/.46)
            s+=.3*mid*math.exp(-t/.20)
            for k,a in enumerate([.09,.17,.29,.44,.62]):
                s+=(.12 if sea else .09)*burst(t,a,.038,240+k*150 if sea else 1100-k*110)
        elif name in ('win','lose'):
            notes=[392,494,587,784] if name=='win' else [330,311,247,196]
            s=0
            for k,f in enumerate(notes):
                u=t-k*.22
                if u>=0:
                    e=min(1,u/.018)*math.exp(-u/.40)
                    s+=(.14*tone(f,u)+.045*tone(2*f,u)+.018*tone(3*f,u))*e
        else:
            sea=name.endswith('sea')
            swell=.55+.35*math.cos(2*PI*t/4)
            s=(.19*low+.06*mid)*swell if sea else .11*low+.016*mid
        data.append(s*env(t,d,.001 if name.startswith(('fire','explode')) else .006))
    if name.startswith(('fire','explode')) or name in ('win','lose'):
        echo(data,.08,.20);echo(data,.17,.10)
    peak=max(abs(x) for x in data)
    limit=.68 if name.startswith(('explode','fire')) else .40 if name in ('win','lose') else .28
    if name.startswith('ambient'):limit=.08
    multiplier=min(1,limit/peak) if peak else 1
    values=array('h',(round(max(-.98,min(.98,s*multiplier))*32767) for s in data))
    file=RAW/f'{name}.wav'
    with wave.open(str(file),'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(RATE);wav.writeframes(values.tobytes())
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(file),'-c:a','libvorbis','-q:a','4',str(OUT/f'{name}.ogg')],check=True)
    # WAV fallback supports browsers whose WebAudio cannot decode Vorbis.
    (OUT/f'{name}.wav').write_bytes(file.read_bytes())
    rms=math.sqrt(sum((s*multiplier)**2 for s in data)/len(data))
    report.append({'file':name,'seconds':d,'peak':round(peak*multiplier,4),'rms':round(rms,4),'sampleRate':RATE})
(ROOT/'source-audio'/'audio-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report,indent=2))
