{ pkgs }: {
    deps = [
        pkgs.rs
        pkgs.nodejs-16_x
        pkgs.yarn
        pkgs.run
        pkgs.cowsay
    ];
}