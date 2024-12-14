interface MenuState {
  openMenus: string[];
  activeItem: string | null;
}

class SidebarState {
  openMenus = $state<string[]>([]);
  activeItem = $state<string | null>(null);
  
  constructor() {
    // Load initial state from localStorage
    this.loadState();
  }
  
  toggleMenu(menuTitle: string, isOpen: boolean) {
    if (isOpen) {
      this.openMenus = [...this.openMenus, menuTitle];
    } else {
      this.openMenus = this.openMenus.filter(title => title !== menuTitle);
    }
    this.saveState();
  }
  
  setActiveItem(itemTitle: string) {
    this.activeItem = itemTitle;
    this.saveState();
  }
  
  private loadState() {
    try {
      const saved = localStorage.getItem('sidebarState');
      if (saved) {
        const state: MenuState = JSON.parse(saved);
        this.openMenus = state.openMenus;
        this.activeItem = state.activeItem;
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error);
    }
  }
  
  private saveState() {
    try {
      const state: MenuState = {
        openMenus: this.openMenus,
        activeItem: this.activeItem
      };
      localStorage.setItem('sidebarState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving sidebar state:', error);
    }
  }
}

export const sidebarState = new SidebarState();
