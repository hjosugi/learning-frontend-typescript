{
  description = "Development shell for frontend TypeScript learning labs";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs
              pkgs.pnpm
              pkgs.python3
            ];

            shellHook = ''
              echo "learning-frontend-typescript dev shell"
              echo "Try: node projects/browser-state-lab/state-core.test.mjs"
              echo "Try: pnpm --filter react-notes build"
              echo "Try: pnpm --filter react-color-lab build"
            '';
          };
        });
    };
}
