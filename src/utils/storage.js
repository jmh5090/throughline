const STORE_KEY = "throughline:v1";

export function loadState() {
  try {
    const data = localStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function persistState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error(e);
  }
}
