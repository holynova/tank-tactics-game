import fs from 'node:fs/promises';
import ts from 'typescript';
// Run the existing pure rules with Node without introducing a new runtime dependency.
async function compile(path) {
  const source = await fs.readFile(new URL('../src/'+path,import.meta.url),'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
  return import('data:text/javascript;base64,'+Buffer.from(output.replace(/import \{ SIZE \} from [^;]+;/,'const SIZE=4;')).toString('base64'));
}
const move=await compile('rules/movementRules.ts');
const eat=await compile('rules/eatingRules.ts');
const win=await compile('rules/winCondition.ts');
export const rules={...move,...eat,...win};
