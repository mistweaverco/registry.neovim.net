#!/usr/bin/env bash


RELEASE_ACTION="create"
GH_TAG=$(date +%Y-%m-%d-%H-%M)

create_registry() {
  (cd scripts && bun . &&  zip -r ../neovim-registry.json.zip ../web/static/neovim-registry.json) || exit 1
  sha256sum ../neovim-registry.json ../neovim-registry.json.zip > ../neovim-registry-checksums.txt || exit 1
}

set_release_action() {
  if gh release view "$GH_TAG" --json id --jq .id > /dev/null 2>&1; then
    echo "Release $GH_TAG already exists, updating it"
    RELEASE_ACTION="edit"
  else
    echo "Release $GH_TAG does not exist, creating it"
    RELEASE_ACTION="create"
  fi
}

do_gh_release() {
  if [ "$RELEASE_ACTION" == "edit" ]; then
    echo "Overwriting existing release $GH_TAG"
    gh release upload --clobber "$GH_TAG" neovim-registry.json.zip neovim-registry-checksums.txt
  else
    echo "Creating new release $GH_TAG"
    gh release create --generate-notes "$GH_TAG" neovim-registry.json.zip neovim-registry-checksums.txt
  fi
}

release() {
  create_registry
  set_release_action
  do_gh_release
}

release
