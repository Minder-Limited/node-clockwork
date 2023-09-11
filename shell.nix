{ pkgs ? import <nixpkgs> {} }:

let
  lib = import <nixpkgs/lib>;
  buildNodeJs = pkgs.callPackage <nixpkgs/pkgs/development/web/nodejs/nodejs.nix> {};

  nodejs = buildNodeJs {
    enableNpm = true;
    version = "14.20.0";
    sha256 = "K1CYSYiJ0eapcJ1j89b5TmlqWtgiFhjF1RFZzuNjmWo=";
  };

  NPM_CONFIG_PREFIX = toString ./npm_config_prefix;

in pkgs.mkShell {
  packages = with pkgs; [
    # nodejs
    nodejs-16_x
    nodePackages.npm
    nodePackages.pm2
  ];

  inherit NPM_CONFIG_PREFIX;

  shellHook = ''
    export PATH="${NPM_CONFIG_PREFIX}/bin:$PATH"
  '';
}
