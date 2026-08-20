# Examples

The CLI is itself the example — see the worked session in the
[README](../README.md#a-worked-session).

For programmatic use, reach for the
[SDK](https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK) instead of
shelling out to this binary; it returns typed values rather than text.

Two things worth copying from how this CLI works:

- **Loopback redirect, not a hosted page.** A one-shot listener on `127.0.0.1`,
  started before the browser opens and shut down as soon as the code arrives. A
  hosted redirect would mean trusting a page you do not control with the
  authorization code.
- **`state` compared on return.** Generated randomly per login and checked
  before the code is used. That is what makes a forged callback inert.
