import Renderer from './Renderer';
import SharedCanvas2D from './SharedCanvas2D';
import Texture from './Texture';

const C_A = 'A'.charCodeAt(0);
const C_Z = 'Z'.charCodeAt(0);
const C_a = 'a'.charCodeAt(0);
const C_z = 'z'.charCodeAt(0);
const C_0 = '0'.charCodeAt(0);
const C_9 = '9'.charCodeAt(0);

function breakIntoWords(text: string) {
    const len = text.length;
    const words: string[] = [];
    let wordStart = 0;
    for (let i = 1; i < len; ++i) {
        const charCode = text.charCodeAt(i);
        if (!(
            charCode >= C_A && charCode <= C_Z
            || charCode >= C_a && charCode <= C_z
            || charCode >= C_0 && charCode <= C_9
        )) {
            words.push(text.substring(wordStart, i));
            wordStart = i;
        }
    }
    if (wordStart <= len - 1) {
        words.push(text.substring(wordStart, len));
    }
    return words;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const lines: string[][] = [];
    const words = breakIntoWords(text);
    let line: string[] = [];
    let lineWidth = 0;
    let actualMaxWidth = 0;
    words.forEach(word => {
        if (word === '\n') {
            lines.push(line);
            actualMaxWidth = Math.max(lineWidth, actualMaxWidth);
            line = [];
            lineWidth = 0;
            return;
        }
        const wordWidth = ctx.measureText(word).width;
        if (lineWidth + wordWidth <= maxWidth) {
            lineWidth += wordWidth;
            line.push(word);
        } else if (line.length < 1) {
            lines.push([word]);
            actualMaxWidth = Math.max(wordWidth, actualMaxWidth);
        } else {
            lines.push(line);
            actualMaxWidth = Math.max(lineWidth, actualMaxWidth);
            lineWidth = wordWidth;
            line = [word];
        }
    });
    if (line.length) {
        lines.push(line);
        actualMaxWidth = Math.max(lineWidth, actualMaxWidth);
    }
    return {lines: lines.map(line => line.join('').trim()), actualMaxWidth};
}

type FontStyle = 'normal' | 'italic' | 'oblique';
type FontVariant = 'normal' | 'small-caps';
type FontWeight = 'normal' | 'bold';

export default class Label {

    private _text?: string;
    private _multiline: boolean = false;
    private _textBaseline: CanvasTextBaseline = 'alphabetic';
    private _fontStyle: FontStyle = 'normal';
    private _fontVariant: FontVariant = 'normal';
    private _fontWeight: FontWeight = 'normal';
    private _fontSize: number = 12;
    private _fontFamily: string = 'sans-serif';
    private _lineSpacing: number = 2;
    private _maxWidth: number = 0;
    private _color: string = '#ffffff';

    private needsUpdateImageData: boolean = true;
    private needsUpdateTexture: boolean = true;

    private _imageData?: ImageData;
    private _texture?: Texture;

    constructor(text?: string) {
        this._text = text;
    }

    get text(): string {
        return this._text || '';
    }

    set text(value: string) {
        if (this._text === value) {
            return;
        }
        this._text = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get multiline(): boolean {
        return this._multiline;
    }

    set multiline(value: boolean) {
        if (this._multiline === value) {
            return;
        }
        this._multiline = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get textBaseline(): CanvasTextBaseline {
        return this._textBaseline;
    }

    set textBaseline(value: CanvasTextBaseline) {
        if (this._textBaseline === value) {
            return;
        }
        this._textBaseline = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get fontStyle(): FontStyle {
        return this._fontStyle;
    }

    set fontStyle(value: FontStyle) {
        if (this._fontStyle === value) {
            return;
        }
        this._fontStyle = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get fontVariant(): FontVariant {
        return this._fontVariant;
    }

    set fontVariant(value: FontVariant) {
        if (this._fontVariant === value) {
            return;
        }
        this._fontVariant = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get fontWeight(): FontWeight {
        return this._fontWeight;
    }

    set fontWeight(value: FontWeight) {
        if (this._fontWeight === value) {
            return;
        }
        this._fontWeight = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(value: number) {
        if (this._fontSize === value) {
            return;
        }
        this._fontSize = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get fontFamily(): string {
        return this._fontFamily;
    }

    set fontFamily(value: string) {
        if (this._fontFamily === value) {
            return;
        }
        this._fontFamily = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get lineSpacing(): number {
        return this._lineSpacing;
    }

    set lineSpacing(value: number) {
        if (this._lineSpacing === value) {
            return;
        }
        this._lineSpacing = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get maxWidth(): number {
        return this._maxWidth;
    }

    set maxWidth(value: number) {
        if (this._maxWidth === value) {
            return;
        }
        this._maxWidth = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        if (this._color === value) {
            return;
        }
        this._color = value;
        this.needsUpdateImageData = true;
        this.needsUpdateTexture = true;
    }

    get width(): number {
        if (this.needsUpdateImageData) {
            this.updateImageData();
        }
        return this._imageData?.width || 0;
    }

    get height(): number {
        if (this.needsUpdateImageData) {
            this.updateImageData();
        }
        return this._imageData?.height || 0;
    }

    private updateImageData() {
        const c2d = SharedCanvas2D.instance();
        const text = this.text || '';
        const font = `${this.fontStyle} ${this.fontVariant} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        const ctx = c2d.ctx;
        ctx.textBaseline = this.textBaseline;
        ctx.font = font;
        const metrics = ctx.measureText(text);
        const ascent = metrics.actualBoundingBoxAscent;
        const descent = metrics.actualBoundingBoxDescent;
        let lines: string[];
        let actualMaxWidth: number;
        if (this.multiline) {
            const result = wrapText(ctx, text, this.maxWidth > 0 ? this.maxWidth : Infinity);
            lines = result.lines;
            actualMaxWidth = result.actualMaxWidth;
        } else {
            lines = [text];
            actualMaxWidth = metrics.width;
        }
        const width = Math.ceil(actualMaxWidth);
        const height = Math.ceil((ascent + descent) * lines.length + Math.max(0, lines.length - 1) * this.lineSpacing);
        c2d.fitSize(width, height);
        c2d.clear();
        ctx.fillStyle = this.color;
        ctx.textBaseline = this.textBaseline;
        ctx.font = font;
        let y = ascent;
        for (let i = 0, len = lines.length; i < len; ++i) {
            ctx.fillText(lines[i], 0, y);
            y += ascent + descent + this.lineSpacing;
        }
        this._imageData = ctx.getImageData(0, 0, width, height);
        this.needsUpdateImageData = false;
    }

    texture(renderer: Renderer): Texture {
        if (this.needsUpdateImageData) {
            this.updateImageData();
        }
        if (!this._texture) {
            this.needsUpdateTexture = true;
            this._texture = renderer.createEmptyTexture(1, 1);
        }
        if (this.needsUpdateTexture) {
            renderer.setTextureFromPixels(this._texture, this.width, this.height, this._imageData!.data);
            this.needsUpdateTexture = false;
        }
        return this._texture;
    }

    dispose(renderer: Renderer) {
        if (this._texture) {
            renderer.deleteTexture(this._texture);
            this._texture = undefined;
        }
    }

}
