# GitHub Actions Workflows

This directory contains workflow definitions for the GreenNest CI/CD pipeline.

Available workflows:

- `ci.yml`: build and audit every service, run Semgrep, Gitleaks, Trivy, and Kubescape scans.
- `deploy.yml`: build Docker images and provide branch-based deployment skeletons for `develop`, `main`, and `v*` release tags.

Use `workflow_dispatch` to run these workflows manually if needed.
