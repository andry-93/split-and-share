# Split & Share Security Checklist

## Mobile Permissions
- Keep Android permissions minimal in release.
- Allow only required capabilities: network, contacts import, vibration feedback.
- Remove dangerous permissions unless there is a shipped feature that requires them.

## Local Data Protection
- Persist state in MMKV with encryption enabled.
- Use hardware-backed Android Keystore for MMKV key when available.
- Keep platform fallback keyring storage for environments where hardware-backed key is unavailable.
- Treat empty persisted lists as valid user state (do not auto-restore seed data).

## Logging and Error Reporting
- Do not include PII (phone, email, free text notes) in logs or error payloads.
- Use scoped error codes/messages only.
- Keep analytics payloads metadata-only.

## Contacts and PII Flows
- Request contacts permission only at point-of-use.
- On denial, route user to system settings only when needed.
- Import only required contact fields (name/phone/email).

## PDF and File Handling
- Build report content from in-memory state only.
- Avoid exposing unrestricted local-file paths.
- Disable unnecessary WebView capabilities for local report preview.

## Dependency Hygiene
- Prefer patch/minor upgrades.
- Use `overrides` for vulnerable transitive packages when direct upgrade is not available.
- Review `npm audit` regularly and document residual dev-only risks.
