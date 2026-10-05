import { z } from 'zod';
export const tokenKeys = ['background','foreground','card','cardForeground','primary','primaryForeground','secondary','secondaryForeground','accent','accentForeground','muted','mutedForeground','border','input','ring','destructive','destructiveForeground','success','warning','info'] as const;
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex color');
export const tokensSchema = z.object(Object.fromEntries(tokenKeys.map(k=>[k,hex])) as Record<typeof tokenKeys[number],typeof hex>).strict();
export const fontSchema = z.enum(['Inter','Arial','Georgia','Verdana','Trebuchet MS','Courier New']);
export const themeSchema = z.object({name:z.string().min(1).max(80),description:z.string().max(500),mood:z.array(z.string().max(40)).min(1).max(8),light:tokensSchema,dark:tokensSchema,typography:z.object({heading:fontSchema,body:fontSchema}).strict(),radius:z.string().regex(/^(?:0|(?:\d|1\d)(?:\.\d{1,2})?)(?:rem|px)$/),shadows:z.object({soft:z.string().regex(/^(none|[\d .pxrem-]+ rgba\([\d,. ]+\))$/),medium:z.string().regex(/^(none|[\d .pxrem-]+ rgba\([\d,. ]+\))$/),strong:z.string().regex(/^(none|[\d .pxrem-]+ rgba\([\d,. ]+\))$/)}).strict(),accessibilityNotes:z.string().max(1000),explanation:z.string().max(1000)}).strict();
export type Theme = z.infer<typeof themeSchema>;
export type Tokens = z.infer<typeof tokensSchema>;
export type Mode = 'light'|'dark';
export const generationSchema=z.object({themes:z.array(themeSchema).length(3)}).strict();
export const generationInput=z.object({prompt:z.string().trim().min(10).max(3000),provider:z.enum(['openai','claude','glm']),model:z.string().trim().max(100).regex(/^[\w.:-]*$/).optional()}).strict();
export type GenerationInput=z.infer<typeof generationInput>;
export function contrast(a:string,b:string){const lum=(hex:string)=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);}
export function contrastChecks(tokens:Tokens){return (['primary','background','card','destructive'] as const).map(key=>{const foreground=key==='background'?'foreground':`${key}Foreground` as keyof Tokens;const ratio=contrast(tokens[key],tokens[foreground]);return {key,ratio,status:ratio>=4.5?'Good':ratio>=3?'Warning':'Poor'};});}
export function cssVariables(theme:Theme,mode:Mode):Record<string,string>{return {...Object.fromEntries(tokenKeys.map(k=>[`--${k.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)}`,theme[mode][k]])),'--font-heading':`"${theme.typography.heading}", sans-serif`,'--font-body':`"${theme.typography.body}", sans-serif`,'--radius':theme.radius,'--shadow-soft':theme.shadows.soft,'--shadow-medium':theme.shadows.medium,'--shadow-strong':theme.shadows.strong};}
