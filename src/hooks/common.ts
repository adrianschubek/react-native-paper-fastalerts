import { useAlertsStore, Alert } from "../stores/AlertStore";

/**
 * Display alerts.
 * @returns functions to display alerts.
 */
export function useAlerts() {
  const dispatch = useAlertsStore((state) => state.dispatch);

  return {
    alert: (config: Partial<Alert>) => {
      dispatch({
        icon: "",
        ...config,
      });
    },
    /**
     * Creates a success alert using the given config.
     */
    success: (config: Partial<Alert>) => {
      dispatch({
        icon: "check",
        title: "Success",
        ...config,
      });
    },
    error: (config: Partial<Alert>) => {
      dispatch({
        icon: "alert-decagram",
        title: "Error",
        ...config,
      });
    },
    warning: (config: Partial<Alert>) => {
      dispatch({
        icon: "alert",
        title: "Warning",
        ...config,
      });
    },
    info: (config: Partial<Alert>) => {
      dispatch({
        icon: "information-outline",
        title: "Info",
        ...config,
      });
    },
    confirm: (config: Partial<Alert>) => {
      dispatch({
        icon: "help-box",
        title: "Confirm",
        cancelText: "Cancel",
        okText: "OK",
        ...config,
      });
    },
  };
}