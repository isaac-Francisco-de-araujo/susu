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

- Keep domain mock data and TypeScript interfaces in `src/lib/mock-data.ts`; this provides a single replacement seam for the future REST API.
- Public and professional experiences use separate TanStack routes; this keeps customer navigation and business workflows independently shareable.
- Admin feature pages share `AdminShell`; this preserves one responsive navigation model across all professional workflows.
