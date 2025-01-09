import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class TextTool extends BaseTool {
  private isEditing = false;
  private editingPosition: Point | null = null;
  private textInput: HTMLTextAreaElement | null = null;

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.addEventListener('click', this.handleClick);
    canvas.style.cursor = 'text';
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('click', this.handleClick);
    this.removeTextInput();
    canvas.style.cursor = 'default';
  }

  private handleClick = (e: MouseEvent) => {
    if (this.isEditing) return;

    const point = this.getMapPoint(e);
    if (!point) return;

    this.editingPosition = point;
    this.isEditing = true;
    this.createTextInput(point);
  };

  private createTextInput(point: Point) {
    const projected = this.map.project([point.lng, point.lat]);
    const canvas = this.canvasManager.getCanvas();
    const rect = canvas.getBoundingClientRect();

    this.textInput = document.createElement('textarea');
    Object.assign(this.textInput.style, {
      position: 'fixed',
      left: `${rect.left + projected.x}px`,
      top: `${rect.top + projected.y}px`,
      transform: 'translate(-50%, -50%)',
      minWidth: '100px',
      minHeight: '1em',
      padding: '4px 8px',
      border: '2px dashed #808080 !important',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      fontSize: '16px',
      zIndex: '1000',
      color: this.style.fontColor || this.style.lineColor,
      resize: 'none',
      overflow: 'hidden'
    });

    this.textInput.addEventListener('input', this.handleInput);
    this.textInput.addEventListener('keydown', this.handleKeyDown);
    this.textInput.addEventListener('blur', this.handleBlur);

    document.body.appendChild(this.textInput);
    this.textInput.focus();
  }

  private removeTextInput() {
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.removeEventListener('input', this.handleInput);
      this.textInput.removeEventListener('keydown', this.handleKeyDown);
      this.textInput.removeEventListener('blur', this.handleBlur);
      this.textInput.parentNode.removeChild(this.textInput);
      this.textInput = null;
    }
    this.isEditing = false;
    this.editingPosition = null;
  }

  private handleInput = () => {
    if (!this.textInput) return;
    this.textInput.style.height = 'auto';
    this.textInput.style.height = `${this.textInput.scrollHeight}px`;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      this.completeTextInput();
    } else if (e.key === 'Escape') {
      this.removeTextInput();
    }
  };

  private handleBlur = () => {
    this.completeTextInput();
  };

  private completeTextInput() {
    if (!this.textInput || !this.editingPosition) return;

    const text = this.textInput.value.trim();
    if (text) {
      console.log('TextTool: Completing text input with:', text);
      
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'text',
        points: [this.editingPosition],
        additionalData: {
          text,
          fontSize: this.style.fontSize || 16,
          fontColor: this.style.fontColor || this.style.lineColor,
          alignment: this.style.textAlignment || 'center'
        }
      });
    }

    this.removeTextInput();
  }

  public updateAlignment(alignment: 'left' | 'center' | 'right') {
    if (this.selectedShape) {
      this.selectedShape.additionalData = {
        ...this.selectedShape.additionalData,
        alignment
      };
      this.canvasManager.redraw();
    }
  }

  redraw() {
    return;
  }
}