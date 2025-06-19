import { tokenizeCode } from '../tokenizer';
import * as acorn from 'acorn';
import { simple } from 'acorn-walk';

describe('tokenizeCode', () => {
    it('should tokenize simple JavaScript code', () => {
        const code = `
            function add(a, b) {
                return a + b;
            }
        `;
        
        const tokens = tokenizeCode(code);
        
        expect(tokens).toBeDefined();
        expect(tokens.length).toBeGreaterThan(0);
        expect(tokens).toContainEqual(
            expect.objectContaining({
                type: 'Identifier',
                value: 'add'
            })
        );
    });

    it('should track token positions correctly', () => {
        const code = `const x = 5;`;
        
        const tokens = tokenizeCode(code);
        
        const constToken = tokens.find(t => t.value === 'const');
        expect(constToken).toBeDefined();
        expect(constToken).toHaveProperty('start');
        expect(constToken).toHaveProperty('end');
        expect(constToken?.start).toBe(0);
    });

    it('should normalize similar patterns', () => {
        const code1 = `eval("alert('hello')")`;
        const code2 = `eval("console.log('world')")`;
        
        const tokens1 = tokenizeCode(code1);
        const tokens2 = tokenizeCode(code2);
        
        // The eval calls should be normalized similarly
        const evalToken1 = tokens1.find(t => t.type === 'CallExpression' && t.value === 'eval');
        const evalToken2 = tokens2.find(t => t.type === 'CallExpression' && t.value === 'eval');
        
        expect(evalToken1?.normalized).toBe(evalToken2?.normalized);
    });

    it('should handle TypeScript syntax', () => {
        const code = `
            interface Person {
                name: string;
                age: number;
            }
            
            class Employee implements Person {
                constructor(public name: string, public age: number) {}
            }
        `;
        
        const tokens = tokenizeCode(code);
        
        expect(tokens).toBeDefined();
        expect(tokens.some(t => t.value === 'interface')).toBe(true);
        expect(tokens.some(t => t.value === 'implements')).toBe(true);
    });

    it('should handle potential security patterns', () => {
        const code = `
            const userInput = req.body.input;
            eval(userInput);
            
            document.write(userInput);
            
            new Function(userInput)();
        `;
        
        const tokens = tokenizeCode(code);
        
        // Should identify dangerous function calls
        expect(tokens.some(t => 
            t.type === 'CallExpression' && 
            ['eval', 'Function'].includes(t.value as string)
        )).toBe(true);
        
        // Should track data flow of user input
        expect(tokens.some(t => t.value === 'userInput')).toBe(true);
    });
});
