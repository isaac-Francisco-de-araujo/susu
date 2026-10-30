<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep domain mock data and TypeScript interfaces in `front/src/lib/mock-data.ts`; this provides a single replacement seam for the future REST API.
- Public and professional experiences use separate TanStack routes; this keeps customer navigation and business workflows independently shareable.
- Admin feature pages share `AdminShell`; this preserves one responsive navigation model across all professional workflows.
- Any route that owns nested admin pages remains an Outlet-only layout; dashboard content lives in its index leaf so every child can render.
- Public booking happens only via WhatsApp links from front/src/lib/config.ts; no internal booking route.
- Services use one API-backed store (front/src/lib/services-store.ts) shared by site and admin; keep loading, error and mutation handling centralized there.
- Frontend source, static assets and tool configuration live in front/; root launchers and src/public/components.json symlinks preserve Lovable entry discovery without duplicate source. Keep root package.json and lockfile as the single dependency manifest and run scripts from the root; this preserves the platform install/build contract. Future backend lives in back/.
