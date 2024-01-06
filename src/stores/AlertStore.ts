import { StyleProp, TextStyle } from "react-native";
import { create } from "zustand";

export type CommonInput = {
  /**
   * The label to display for the input.
   */
  label: string;
  /**
   * The helper text to display for the input.
   */
  helperText: string;
  /**
   * The placeholder text to display for the input.
   */
  placeholder: string;
  /**
   * The default value of the input.
   */
  defaultValue: string;
  /**
   * Whether or not the input is required.
   */
  required: boolean;
  /**
   * The icon to display for the input.
   */
  icon: string;
  /**
   * The validator function to use for the input. It should return true if the input is valid, and false otherwise.
   * @param value The value of the input.
   * @param allValues All input values in the alert.
   */
  validator: (value: string, allValues: string[]) => boolean;
  /**
   * The error text to display if the input is invalid.
   */
  errorText: string;
  /**
   * Whether or not the input is disabled.
   */
  disabled?: boolean;
};

export type TextInput = CommonInput & {
  /**
   * The type of the input.
   */
  type: "text" | "number" | "password";
  /**
   * Whether or not the input should support multiline text.
   */
  multiline: boolean;
};
export type CheckboxInput = CommonInput & {
  type: "checkbox";
};
export type ButtonInput = CommonInput & {
  type: "button";
  /**
   * The action to perform when the button is clicked.
   *
   * if the action returns `string`, the alert will NOT be dismissed and the string will be displayed as an error.
   *
   * Return an empty string to keep the alert open without displaying an error.
   *
   * @param values All input values in the alert.
   * @param setValues The function to use to set the values of the inputs. Current values passed as argument. Return the new values.
   */
  action: (
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>
  ) => string | void | Promise<string | void>;
};
export type SearchSelectInput = CommonInput & {
  type: "search-select";
  /**
   * key-value pairs of options to display in the select.
   */
  data: { key: string; value: string; label?: string }[];
  /**
   * Number of options to display in the (virtualized) list.
   */
  visibleOptions: number;
};

export type SelectInput = Omit<SearchSelectInput, "type"> & {
  type: "select";
};

export type RadioInput = Omit<SearchSelectInput, "type"> & {
  type: "radio";
};

export type SearchRadioInput = Omit<SearchSelectInput, "type"> & {
  type: "search-radio";
};

// TODO
type DropdownInput = CommonInput & {
  type: "dropdown";
  /**
   * key-value pairs of options to display in the select.
   */
  data: { key: string; value: string }[];
};

export type CustomInput = CommonInput & {
  type: "custom";
  /**
   * The render function to use for the input.
   * @param value The current value of the input.
   * @param setValue The function to use to set the value of the input.
   * @param allValues All input values in the alert.
   * @param tempValue The temporary internal value of the input.
   * @param setTempValue The function to use to set the temporary internal value of the input.
   */
  render: (
    value: string,
    setValue: (newVal: string) => void,
    allValues: string[],
    tempValue: string,
    setTempValue: (newVal: string) => void
  ) => JSX.Element;
};

export type AlertField =
  | TextInput
  | CheckboxInput
  | ButtonInput
  | SearchSelectInput
  | SelectInput
  | RadioInput
  | SearchRadioInput
  | CustomInput;
// | DropdownInput;

/* export function isTextInput(input: AlertField): input is TextInput {
  return input.type === "text" || input.type === "number" || input.type === "password";
}
export function isCheckboxInput(input: AlertField): input is CheckboxInput {
  return input.type === "checkbox";
}
export function isButtonInput(input: AlertField): input is ButtonInput {
  return input.type === "button";
}
export function isSearchSelectInput(input: AlertField): input is SearchSelectInput {
  return input.type === "search-select";
} */

export type Alert = {
  /**
   * The key of the alert. Used to prevent duplicate alerts from being added to the queue.
   *
   * If the key is already in the queue, the alert will not be added.
   */
  key?: string;
  /**
   * The icon to display in the alert.
   */
  icon: string;
  /**
   * The title of the alert.
   */
  title: string;
  /**
   * Custom style for the title.
   */
  titleStyle: StyleProp<TextStyle>;
  /**
   * The message of the alert.
   */
  message: string;
  /**
   * Custom style for the message.
   */
  messageStyle: StyleProp<TextStyle>;
  /**
   * The text to display on the "OK" button.
   */
  okText: string;
  /**
   * The text to display on the "Cancel" button.
   */
  cancelText: string;
  /**
   * Whether or not the alert can be dismissed (e.g. by clicking outside of the alert).
   */
  dismissable: boolean;
  /**
   * Shows a cover behind the alert to hide the rest of the screen.
   */
  cover?: boolean;
  /**
   * The action to perform when the "OK" button is clicked.
   *
   * if the action returns `string`, the alert will NOT be dismissed and the string will be displayed as an error.
   *
   * Return an empty string to keep the alert open without displaying an error.
   *
   * @param values All input values in the alert.
   */
  okAction: (values: string[]) => string | void | Promise<string | void>;
  /**
   * The action to perform when the "Cancel" button is clicked.
   *
   * if the action returns `string`, the alert will NOT be dismissed and the string will be displayed as an error.
   *
   * Return an empty string to keep the alert open without displaying an error.
   *
   * @param values All input values in the alert.
   */
  cancelAction: (values: string[]) => string | void | Promise<string | void>;
  /**
   * The fields to display in the alert.
   * @see AlertField
   */
  fields: Partial<AlertField>[];
};

export const DEFAULT_ALERT: Alert = {
  icon: "information-outline",
  title: "",
  titleStyle: {},
  message: "",
  messageStyle: {},
  okText: "OK",
  cancelText: "",
  dismissable: true,
  okAction: () => {},
  cancelAction: () => {},
  fields: [],
  cover: false,
};

export const DEFAULT_ALERT_INPUT: AlertField = {
  validator: () => true,
  label: "",
  helperText: "",
  placeholder: "",
  defaultValue: "",
  icon: "",
  required: false,
  type: "text",
  errorText: "",
  disabled: false,
  // @ts-expect-error FIXME
  action: () => {},
  visibleOptions: 5,
  data: [],
  multiline: false,
};

export type AlertsStoreType = {
  /**
   * The current alert to display.
   */
  activeAlert: Alert | null;
  /**
   * The queue of alerts to display.
   */
  alerts: Alert[];
  /**
   * Creates a new alert and adds it to the queue.
   */
  dispatch: (alert: Partial<Alert>) => void;
  /**
   * Removes the current alert from the queue and sets the next alert as the current alert.
   */
  next: () => void;
};

/**
 * internal. do not use.
 *
 * @see Use `const { alert } = useAlerts();` instead.
 */
export const useAlertsStore = create<AlertsStoreType>((set, get) => ({
  activeAlert: null,
  alerts: [],
  dispatch: (alert: Partial<Alert>) => {
    // ignore duplicate alerts already in queue
    if (
      alert.key &&
      (get().activeAlert?.key === alert.key ||
        get().alerts.some((a) => a.key === alert.key))
    )
      return;
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          ...DEFAULT_ALERT,
          ...{
            ...alert,
            fields: alert.fields
              ? alert.fields.map((input) => ({
                  ...DEFAULT_ALERT_INPUT,
                  ...input,
                }))
              : [],
          },
        },
      ],
    }));
  },
  next: () => {
    set((state) => ({
      alerts: state.alerts.slice(1),
      activeAlert: state.alerts[0],
    }));
  },
}));

/**
 * Converts an array string value from actions parameter to an array.
 */
export function toArray<T>(
  value?: string,
  mapFn: (el: string) => T = (el) => el as T
): T[] {
  return (value ?? "").split("|").map(mapFn) as T[];
}
