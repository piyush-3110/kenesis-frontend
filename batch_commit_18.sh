#!/bin/bash

# Kinesis Frontend Batch Commit Script (18 commits)
# Self-destructs after completion

echo "🚀 Starting batch commit process for 18 commits..."
echo ""

# Commit 1: Update authentication page
 git add src/app/auth/page.tsx
 git commit -m "fix(auth): update authentication page UI and logic"

# Commit 2: Update email verification page
 git add src/app/auth/verify-email/page.tsx
 git commit -m "fix(auth): improve email verification flow and error handling"

# Commit 3: Update dashboard settings page
 git add src/app/dashboard/settings/page.tsx
 git commit -m "fix(settings): enhance dashboard settings page layout and logic"

# Commit 4: Update main layout
 git add src/app/layout.tsx
 git commit -m "fix(layout): update main layout for improved navigation"

# Commit 5: Update Navbar component
 git add src/components/Landing/Navbar.tsx
 git commit -m "fix(navbar): improve responsive dropdown and dashboard access"

# Commit 6: Update AuthInitializer component
 git add src/components/auth/AuthInitializer.tsx
 git commit -m "fix(auth): refactor AuthInitializer for better state management"

# Commit 7: Add product creation status documentation
 git add PRODUCT_CREATION_STATUS.md
 git commit -m "docs(products): add product creation status summary file"

# Commit 8: Add debug resend verification script
 git add debug-resend-verification.js
 git commit -m "chore(debug): add resend verification debug script"

# Commit 9: Add debug resend script
 git add debug-resend.js
 git commit -m "chore(debug): add resend debug script"

# Commit 10: Add new next.js config
 git add next.config.new.ts
 git commit -m "chore(config): add new next.js config for testing"

# Commit 11: Add reset password route
 git add src/app/auth/reset-password/
 git commit -m "feat(auth): add reset password route and logic"

# Commit 12: Add SecuritySettingsCard component
 git add src/app/dashboard/settings/components/SecuritySettingsCard.tsx
 git commit -m "feat(settings): add SecuritySettingsCard component"

# Commit 13: Add DashboardProtection component
 git add src/components/auth/DashboardProtection.tsx
 git commit -m "feat(auth): add DashboardProtection for dashboard routes"

# Commit 14: Add RouteGuard component
 git add src/components/auth/RouteGuard.tsx
 git commit -m "feat(auth): add RouteGuard for protected routes"

# Commit 15: Add ToastContainer UI component
 git add src/components/ui/ToastContainer.tsx
 git commit -m "feat(ui): add ToastContainer for global notifications"

# Commit 16: Add useNavbarAuth hook
 git add src/hooks/useNavbarAuth.ts
 git commit -m "feat(auth): add useNavbarAuth hook for navbar state"

# Commit 17: Add new AuthStore
 git add src/store/useAuthStoreNew.ts
 git commit -m "feat(auth): add new Zustand AuthStore implementation"

# Commit 18: Add test registration script
 git add test-registration.sh
 git commit -m "chore(test): add test registration shell script"

# Self-destruct
rm -- "$0"
echo "✅ All 18 commits completed. Script removed."
