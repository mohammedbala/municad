export interface IconItem {
    id: string;
    name: string;
    path: string;
  }
  
  export function getTrafficSignIcons(): IconItem[] {
    const files = import.meta.glob('../../../assets/traffic_signs/*.svg', { eager: true });
    return Object.entries(files).map(([path, module]) => {
      const fileName = path.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
      return {
        id: fileName,
        name: fileName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        path: (module as { default: string }).default
      };
    });
  }
  
  export function getTrafficSymbolIcons(): IconItem[] {
    const files = import.meta.glob('../../../assets/traffic_symbols/*.svg', { eager: true });
    return Object.entries(files).map(([path, module]) => {
      const fileName = path.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
      return {
        id: fileName,
        name: fileName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        path: (module as { default: string }).default
      };
    });
  } 