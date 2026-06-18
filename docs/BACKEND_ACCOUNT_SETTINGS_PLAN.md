# Backend Account Settings Plan

## Summary

The settings page expects backend support for account deactivation and GitHub OAuth reauthorization. Account editing and standalone GitHub unlinking are intentionally out of scope for this phase.

## Required API Changes

- Add `POST /user/deactivate`.
  - Require an authenticated user.
  - Change the user status from `ACTIVE` to `DEACTIVATED`.
  - Return `{ "success": true, "status": "DEACTIVATED" }`.
- Support GitHub OAuth reauthorization.
  - Accept `GET /auth/github?mode=reauthorize`.
  - Identify the existing authenticated user and refresh stored GitHub OAuth permission/token data.
  - Keep the callback compatible with the current frontend callback shape: `access_token`, `refresh_token`, and `username`.
- Do not add a separate GitHub unlink endpoint in this phase.
  - GitHub unlink requests are represented by account deactivation because GitHub OAuth is currently the only login method.

## Deactivated Account Policy

- Authenticated API requests from deactivated users should return `403` or a product-specific error code that the frontend can map to a re-login/account status message.
- OAuth login for a deactivated account should not silently restore a normal active session.
- The backend should define whether reactivation is possible in a later policy decision.

## Security Notes

- The deactivation endpoint must verify the caller owns the account being deactivated.
- Do not accept a user id from the client for this action.
- Avoid logging access tokens, refresh tokens, or OAuth callback query strings.
