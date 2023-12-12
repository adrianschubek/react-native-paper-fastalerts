import {
  Button,
  Card,
  Checkbox,
  Dialog,
  HelperText,
  Portal,
  RadioButton,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useAlertsStore } from "../stores/AlertStore";
import {
  FC,
  Fragment,
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  VirtualizedList,
} from "react-native";

/**
 * Universal alert component that can be used to display alerts.
 * @see useAlerts
 */
function AlertContainer() {
  const activeAlert = useAlertsStore((state) => state.activeAlert);
  const alerts = useAlertsStore((state) => state.alerts);
  const _next = useAlertsStore((state) => state.next);

  const [values, setValues] = useState<string[]>([]);
  const [tempError, setTempError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const [tempValues, setTempValues] = useState<string[]>([]);

  /**
   * Temp fix for
   * Problem:
   *
   * if alert A has 1 field. and alert b has 3 fields.
   * opening alert 1 init values [""] THEN open alert b => short time ["",undefined,undefined] CRASH! (=> ["","",""])
   */
  const [initDone, setInitDone] = useState<boolean>(true);

  const next = () => {
    setInitDone(() => false);
    // console.log("next...");
    _next();
  };

  useEffect(() => {
    if (!activeAlert && alerts?.length > 0) {
      next();
    }
  }, [activeAlert, alerts]);

  useEffect(() => {
    if (activeAlert) {
      setValues(() =>
        activeAlert?.fields?.length !== 0
          ? activeAlert.fields.map((field) => field.defaultValue ?? "")
          : [],
      );
      setTempError(() => null);
      setTempValues(() => activeAlert?.fields?.map(() => "") ?? []);
      setBusy(() => false);
      // console.log("setinit " + JSON.stringify(values));
      setInitDone(() => true);
    }
  }, [activeAlert]);

  const theme = useTheme();

  const getBody = () => {
    // console.log("!!! " + JSON.stringify(values));
    if (
      !activeAlert ||
      (activeAlert?.fields?.length !== 0 && values.length === 0) ||
      !initDone
    )
      return null;
    const {
      icon,
      title,
      titleStyle,
      message,
      messageStyle,
      okAction,
      cancelAction,
      okText,
      cancelText,
      dismissable,
      fields: inputs,
    } = activeAlert;
    // TODO: add X close button
    return (
      <>
        {icon && (
          <Dialog.Icon color={theme.colors.primary} size={40} icon={icon} />
        )}
        {title && (
          <Dialog.Title style={{ textAlign: "center", marginTop: 8 }}>
            <Text
              style={{
                color: theme.colors.primary,
                textAlign: "center",
                ...(titleStyle as {}),
              }}
              variant="titleLarge"
            >
              {title}
            </Text>
          </Dialog.Title>
        )}
        {(message || inputs?.length !== 0) && (
          <>
            <Dialog.Content
              style={{
                marginTop: !title ? (icon ? 15 : 40) : undefined,
              }}
            >
              {message && (
                <Text
                  style={{
                    textAlign: "center",
                    ...(messageStyle as {}),
                  }}
                  variant="bodyMedium"
                >
                  {message}
                </Text>
              )}
              {inputs.map((field, i) => (
                <Fragment key={i}>
                  {field.type === "checkbox" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          const newValues = [...values];
                          newValues[i] =
                            values[i] === "true" ? "false" : "true";
                          setValues(newValues);
                        }}
                      >
                        <TextInput
                          style={{
                            marginVertical: 2,
                            marginTop: 10,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                          }}
                          underlineColor="transparent"
                          theme={{ roundness: 10 }}
                          value={field.label}
                          editable={false}
                          disabled={field.disabled}
                          left={
                            field.icon && <TextInput.Icon icon={field.icon} />
                          }
                          right={
                            <TextInput.Icon
                              icon={() => (
                                <Switch
                                  disabled={field.disabled}
                                  value={values[i] === "true"}
                                  onValueChange={() => {
                                    const newValues = [...values];
                                    newValues[i] =
                                      values[i] === "true" ? "false" : "true";
                                    setValues(newValues);
                                  }}
                                />
                              )}
                            />
                          }
                        />
                      </TouchableOpacity>

                      {field.helperText && (
                        <HelperText type="info" visible={true}>
                          {field.helperText}
                        </HelperText>
                      )}
                      {field.errorText &&
                        !field.validator(values[i], values) && (
                          <HelperText type="error" visible={true}>
                            {field.errorText}
                          </HelperText>
                        )}
                    </>
                  ) : field.type === "button" ? (
                    <>
                      <Button
                        onPress={async () => {
                          try {
                            setTempValues((tempValues) => {
                              const newTempValues = [...tempValues];
                              newTempValues[i] = "busy";
                              return newTempValues;
                            });
                            const ret = await field.action(values);
                            if (typeof ret === "string") {
                              setTempError(ret);
                              return;
                            }
                            next();
                          } finally {
                            setTempValues((tempValues) => {
                              const newTempValues = [...tempValues];
                              newTempValues[i] = "";
                              return newTempValues;
                            });
                          }
                        }}
                        disabled={field.disabled || tempValues[i] === "busy"}
                        style={{ marginTop: 10 }}
                        mode="contained"
                        icon={field.icon}
                      >
                        {field.label}
                      </Button>
                      {field.helperText && (
                        <HelperText type="info" visible={true}>
                          {field.helperText}
                        </HelperText>
                      )}
                    </>
                  ) : field.type === "number" ||
                    field.type === "password" ||
                    field.type === "text" ? (
                    <>
                      <TextInput
                        style={{ marginVertical: 2, marginTop: 10 }}
                        label={field.label}
                        placeholder={field.placeholder}
                        secureTextEntry={field.type === "password"}
                        multiline={field.multiline}
                        left={
                          field.icon && <TextInput.Icon icon={field.icon} />
                        }
                        keyboardType={
                          field.type === "number" ? "number-pad" : "default"
                        }
                        value={values[i]}
                        onChangeText={(text) => {
                          const newValues = [...values];
                          newValues[i] = text;
                          setValues(newValues);
                        }}
                        error={
                          field.validator && !field.validator(values[i], values)
                        }
                        disabled={field.disabled}
                      ></TextInput>
                      {field.helperText && (
                        <HelperText type="info" visible={true}>
                          {field.helperText}
                        </HelperText>
                      )}
                      {field.errorText &&
                        !field.validator(values[i], values) && (
                          <HelperText type="error" visible={true}>
                            {field.errorText}
                          </HelperText>
                        )}
                    </>
                  ) : field.type === "search-select" ||
                    field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "search-radio" ? (
                    <>
                      {(field.type === "search-select" ||
                        field.type === "search-radio") && (
                        <TextInput
                          style={{ marginTop: 10 }}
                          placeholder={
                            field.placeholder ? field.placeholder : "Search"
                          }
                          left={
                            <TextInput.Icon
                              icon={field.icon ? field.icon : "magnify"}
                            />
                          }
                          value={tempValues[i]}
                          onChangeText={(text) => {
                            const newValues = [...tempValues];
                            newValues[i] = text;
                            setTempValues(newValues);
                          }}
                          error={
                            field.data
                              .filter(({ key }) => key.includes(tempValues[i]))
                              .filter((_, i) => i < field.visibleOptions)
                              .length === 0
                          }
                        />
                      )}
                      <FlatList
                        style={{
                          marginTop:
                            field.type === "radio" || field.type === "select"
                              ? 10
                              : undefined,
                        }}
                        nestedScrollEnabled={true}
                        data={field.data
                          .filter(({ key }) => key.includes(tempValues[i]))
                          .filter((_, i) => i < field.visibleOptions)
                          .map(({ key, value, label }) => ({
                            key: String(key),
                            value: String(value),
                            label: label,
                          }))}
                        renderItem={({ item }) => {
                          const { key, value, label } = item;
                          return (
                            <TouchableHighlight
                              underlayColor={theme.colors.backdrop}
                              style={{ borderRadius: 10, marginVertical: 2 }}
                              onPress={() =>
                                field.type === "radio" ||
                                field.type === "search-radio"
                                  ? startTransition(() => {
                                      const newValues = [...values];
                                      newValues[i] = value;
                                      setValues(newValues);
                                    })
                                  : startTransition(() => {
                                      const newValues = [...values];
                                      // if value is already in array, remove it else add it
                                      if (
                                        values[i].split("|").includes(value)
                                      ) {
                                        newValues[i] = values[i]
                                          .split("|")
                                          .filter((v) => v !== value)
                                          .join("|");
                                      } else {
                                        newValues[i] =
                                          value +
                                          (values[i] ? "|" + values[i] : "");
                                      }
                                      setValues(newValues);
                                    })
                              }
                            >
                              <TextInput
                                key={key}
                                theme={{
                                  roundness: 10,
                                }}
                                underlineColor="transparent"
                                style={{
                                  backgroundColor: theme.colors.background,
                                  borderRadius: 10,
                                  // border: 0,
                                }}
                                value={key}
                                editable={false}
                                disabled={field.disabled}
                                left={
                                  field.icon && (
                                    <TextInput.Icon icon={field.icon} />
                                  )
                                }
                                label={label}
                                // multiline={true} //TODO: add multiline support
                                right={
                                  <TextInput.Icon
                                    icon={() =>
                                      field.type === "radio" ||
                                      field.type === "search-radio" ? (
                                        <RadioButton
                                          disabled={field.disabled}
                                          status={
                                            values[i].split("|").includes(value)
                                              ? "checked"
                                              : "unchecked"
                                          }
                                          value={value}
                                          onPress={() => {
                                            startTransition(() => {
                                              const newValues = [...values];
                                              newValues[i] = value;
                                              setValues(newValues);
                                            });
                                          }}
                                        />
                                      ) : (
                                        <Checkbox
                                          disabled={field.disabled}
                                          status={
                                            values[i].split("|").includes(value)
                                              ? "checked"
                                              : "unchecked"
                                          }
                                          onPress={() => {
                                            startTransition(() => {
                                              const newValues = [...values];
                                              // if value is already in array, remove it else add it
                                              if (
                                                values[i]
                                                  .split("|")
                                                  .includes(value)
                                              ) {
                                                newValues[i] = values[i]
                                                  .split("|")
                                                  .filter((v) => v !== value)
                                                  .join("|");
                                              } else {
                                                newValues[i] =
                                                  value +
                                                  (values[i]
                                                    ? "|" + values[i]
                                                    : "");
                                              }
                                              setValues(newValues);
                                            });
                                          }}
                                        />
                                      )
                                    }
                                  />
                                }
                              />
                            </TouchableHighlight>
                          );
                        }}
                      />
                      {field.data
                        .filter(({ key }) => key.includes(tempValues[i]))
                        .filter((_, i) => i < field.visibleOptions).length ===
                      0 ? (
                        <HelperText type={"error"}>No results</HelperText>
                      ) : (
                        <HelperText type="info">
                          {field.helperText
                            ? field.helperText
                            : field.type === "search-radio" ||
                              field.type === "search-select"
                            ? "Specify your query for more results."
                            : undefined}
                        </HelperText>
                      )}
                    </>
                  ) : field.type === "custom" ? (
                    field.render(
                      values[i],
                      (newValue) => (values[i] = newValue),
                      values,
                      tempValues[i],
                      (newValue) => (tempValues[i] = newValue),
                    )
                  ) : (
                    <Text>Unknown field type: {field.type}</Text>
                  )}
                </Fragment>
              ))}
            </Dialog.Content>
          </>
        )}
        {tempError && (
          <Dialog.Content>
            <Card
              mode="outlined"
              theme={{
                colors: {
                  outline: theme.colors.onError,
                  surface: theme.colors.error,
                },
              }}
            >
              <Card.Content>
                <Text style={{ color: theme.colors.onError }}>{tempError}</Text>
              </Card.Content>
            </Card>
          </Dialog.Content>
        )}
        {(okText !== "" || cancelText !== "") && (
          <Dialog.Actions>
            {cancelText !== "" && (
              <Button
                style={{ paddingHorizontal: 10 }}
                mode="contained-tonal"
                disabled={busy}
                onPress={async () => {
                  try {
                    setBusy(() => true);
                    const ret = await cancelAction(values);
                    if (typeof ret === "string") {
                      setTempError(ret);
                      return;
                    }
                    next();
                  } finally {
                    setBusy(() => false);
                  }
                }}
              >
                {cancelText}
              </Button>
            )}
            {okText !== "" && (
              <Button
                style={{ paddingHorizontal: 10 }}
                mode="contained"
                onPress={async () => {
                  try {
                    setBusy(() => true);
                    const ret = await okAction(values);
                    if (typeof ret === "string") {
                      setTempError(ret);
                      return;
                    }
                    next();
                  } finally {
                    setBusy(() => false);
                  }
                }}
                disabled={
                  busy ||
                  inputs?.some(
                    (field, i) =>
                      field.required &&
                      (values[i]?.length === 0 ||
                        (field.validator &&
                          !field.validator(values[i], values))),
                  )
                }
              >
                {okText}
              </Button>
            )}
          </Dialog.Actions>
        )}
      </>
    );
  };

  const memoBody = useMemo(getBody, [
    activeAlert,
    values,
    tempError,
    tempValues,
    busy,
    initDone,
  ]);

  // Fixed: inputvalues may not be set but activeAlert is set during first render. => undefined
  if (
    !activeAlert ||
    (activeAlert?.fields?.length !== 0 && values.length === 0)
  )
    return null;

  return (
    <Dialog
      dismissableBackButton={activeAlert && activeAlert.dismissable}
      visible={true}
      dismissable={activeAlert && activeAlert.dismissable}
      onDismiss={() => activeAlert && activeAlert.dismissable && next()}
      testID={(activeAlert && activeAlert.icon) ?? "" + "_alert"}
      style={{ zIndex: 999999, overflow: "scroll" }}
      theme={{
        colors: {
          backdrop:
            activeAlert && activeAlert.cover
              ? theme.colors.background
              : theme.colors.backdrop,
        },
      }}
    >
      <VirtualizedList
        renderItem={() => null}
        getItemCount={() => 0}
        ListHeaderComponent={memoBody}
      />
    </Dialog>
  );
}

const withPortal =
  <P,>(Component: FC<P>) =>
  (props: P) => (
    <Portal>
      <Component {...props} />
    </Portal>
  );

export default withPortal(AlertContainer);
