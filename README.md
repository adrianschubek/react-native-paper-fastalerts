# react-native-paper-fastalerts
[![npm](https://img.shields.io/npm/v/react-native-paper-fastalerts?style=flat-square&color=blue)](https://www.npmjs.com/package/react-native-paper-fastalerts)
![](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)

A fast and easy to use alert and dialog system for react-native-paper

[fastalerts.adriansoftware.de](https://fastalerts.adriansoftware.de/)

### Demo

https://github.com/adrianschubek/react-native-paper-fastalerts/assets/19362349/99ac2580-82c7-4655-a1a1-0a0d3110b33b

```tsx
import { useAlerts } from "react-native-paper-fastalerts";
 
export default function HelloWorld() {
  const { alert /*, confirm, warning, error, info */ } = useAlerts();
  // or use:  const alerts = useAlerts();
  return (
    <Button
      onPress={() =>
        alert({
          // all options are optional and have sensible defaults
          message: "What is the capital of Germany?",
          okText: "Submit 🔥",
          okAction(values) {
            if (values[0] === "b") {
              alert({ message: "Correct 🤗" });
            } else {
              return "Wrong 😅 Try again.";
            }
          },
          fields: [
            {
              type: "radio",
              data: [
                { key: "Berlin", value: "b" },
                { key: "Paris", value: "p" },
                { key: "London", value: "l" },
                { key: "Madrid", value: "m" },
              ],
            },
          ],
        })
      }
    >
      Ask me a question!
    </Button>
  );
}
```

<!-- TODO: add expo snack for demo -->

<!-- TODO: support button, container styles -->
<!-- TODO: support button style flat/contained -->
<!-- TODO: fix padding/margin bottom of select/radio fields -->
<!-- TODO: more data-testid fields to allow testing e2e -->