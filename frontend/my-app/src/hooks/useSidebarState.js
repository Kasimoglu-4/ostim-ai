import { useReducer } from 'react';
import { SIDEBAR_ACTIONS, SIDEBAR_INITIAL_STATE } from '../constants/sidebar';

const sidebarReducer = (state, action) => {
  switch (action.type) {
    case SIDEBAR_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        isSidebarCollapsed: !state.isSidebarCollapsed,
        isProfileMenuOpen: false // Close profile menu when toggling sidebar
      };
    case SIDEBAR_ACTIONS.TOGGLE_PROFILE_MENU:
      return {
        ...state,
        isProfileMenuOpen: !state.isProfileMenuOpen
      };
    case SIDEBAR_ACTIONS.OPEN_SETTINGS_MODAL:
      return {
        ...state,
        showSettingsModal: true,
        isProfileMenuOpen: false
      };
    case SIDEBAR_ACTIONS.CLOSE_SETTINGS_MODAL:
      return {
        ...state,
        showSettingsModal: false
      };
    case SIDEBAR_ACTIONS.CLOSE_PROFILE_MENU:
      return {
        ...state,
        isProfileMenuOpen: false
      };
    default:
      return state;
  }
};

export const useSidebarState = () => {
  const [state, dispatch] = useReducer(sidebarReducer, SIDEBAR_INITIAL_STATE);

  const toggleSidebar = () => dispatch({ type: SIDEBAR_ACTIONS.TOGGLE_SIDEBAR });
  const toggleProfileMenu = () => dispatch({ type: SIDEBAR_ACTIONS.TOGGLE_PROFILE_MENU });
  const openSettingsModal = () => dispatch({ type: SIDEBAR_ACTIONS.OPEN_SETTINGS_MODAL });
  const closeSettingsModal = () => dispatch({ type: SIDEBAR_ACTIONS.CLOSE_SETTINGS_MODAL });
  const closeProfileMenu = () => dispatch({ type: SIDEBAR_ACTIONS.CLOSE_PROFILE_MENU });

  return {
    state,
    actions: {
      toggleSidebar,
      toggleProfileMenu,
      openSettingsModal,
      closeSettingsModal,
      closeProfileMenu
    }
  };
}; 