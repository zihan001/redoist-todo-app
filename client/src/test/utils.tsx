const { render } = require('@testing-library/react');

function renderWithProviders(ui, { providerProps, ...renderOptions } = {}) {
  return render(ui, { ...renderOptions });
}

module.exports = { renderWithProviders };