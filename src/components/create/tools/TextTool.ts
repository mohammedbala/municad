import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class TextTool extends BaseTool {
  private isEditing = false;
  private editingPosition: Point | null = null;
  private textInput: HTMLInputElement | null = null;

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

    this.textInput = document.createElement('input');
    Object.assign(this.textInput.style, {
      position: 'fixed',
      left: `${rect.left + projected.x}px`,
      top: `${rect.top + projected.y}px`,
      transform: 'translate(-50%, -50%)',
      minWidth: '100px',
      padding: '4px 8px',
      border: '2px solid #1E3A8A',
      borderRadius: '4px',
      backgroundColor: 'white',
      fontSize: '16px',
      zIndex: '1000',
      color: this.style.fontColor || this.style.lineColor
    });

    this.textInput.addEventListener('keydown', this.handleKeyDown);
    this.textInput.addEventListener('blur', this.handleBlur);

    document.body.appendChild(this.textInput);
    this.textInput.focus();
  }

  private removeTextInput() {
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.removeEventListener('keydown', this.handleKeyDown);
      this.textInput.removeEventListener('blur', this.handleBlur);
      this.textInput.parentNode.removeChild(this.textInput);
      this.textInput = null;
    }
    this.isEditing = false;
    this.editingPosition = null;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      
      this.emit(EVENTS.SHAPE_COMPLETE, 
        'text',  // type
        [this.editingPosition],  // points
        { // additionalData
          text: text,
          size: this.style.fontSize || 16,
          fontColor: this.style.fontColor || this.style.lineColor
        }
      );
    }

    this.removeTextInput();
  }

  redraw() {
    return;
  }
}