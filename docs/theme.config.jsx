export default {
  logo: (
    <span>
      react-native-paper-<span style={{ fontWeight: 700 }}>fastalerts</span>
    </span>
  ),
  project: {
    link: "https://github.com/adrianschubek/react-native-paper-fastalerts",
  },
  docsRepositoryBase:
    "https://github.com/adrianschubek/react-native-paper-fastalerts/tree/main/docs",
  // primaryHue: 190,
  // primarySaturation: { dark: 31, light: 48 },
  toc: {
    backToTop: true,
  },
  footer: {
    text: (
      <span>
        © {new Date().getFullYear()} {' '}
        <a href="https://adrianschubek.de" target="_blank">
          Adrian Schubek
        </a>
      </span>
    )
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – react-native-paper-fastalerts',
    }
  }
};
