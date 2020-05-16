# Commands

smol has a powerful and flexible command line interface. You may use smol's cli within the project by running `npx smol <command>`. For convenience, you can install it globally by running `sudo npm i -g github:aligerum/smol`. Then you can use commands by running `smol <command>`. All examples in this documentation use the globally installed version.

You may run smol commands within a smol project directory or any of its subdirectories. Running any smol command outside of a project directory will be aborted. Running `smol` without any arguments shows help.

Use `smol help` and see each individual command's documentation for more information.

# Core Commands

Commands are broken up into global commands and core commands. In other words, smol has commands that are used outside of the context of a specific core, such as `smol console` and `smol init`, but also has commands that apply directly to specific cores.

For example, both the `vue` core and `express` core have a `serve` command, so you would not run `smol serve`, you would run `smol <core> serve`:

```
smol make core express api
smol make core vue pwa

smol api serve start
smol pwa serve start
```

# Arguments, Flags, and Options

By using `smol help <command>`, you can get information about what arguments, flags, and options a command accepts. Take the `make` command for example. Run `smol help make` to see its available arguments.

```
Usage
  smol make [core] <template> <filename> [options]

Description
  Make files from templates

Arguments
  core          Core to make file for (core, optional)
                  api, pwa
  template      Template to make file from (see templates)
  filename      New filename to create

Options
  -e,--edit     Open newly created file in editor
  -f,--force    Overwrite file if it already exists
  -x,--example  Create file from example template if available
```

At the top, we can see that it expects a `template` and `filename` argument, which are both required, however, if you provide 3 arguments, it will assume the first one is actually a `core` argument. The valid values for the core argument are shown in the Arguments section.

Options can also be provided. In this case, `-e` is an alias for `--edit`, so `smol make command dostuff -e` and `smol make command dostuff --edit` are equivalent.

Single character options are always boolean values and referred to as "flags". Flags can be stacked for convenience. For example, both of these are equivalent: `smol make command dostuff -efx`, `smol make command dostuff --edit --example --force`.

# Argument and Option Types

While flags are always boolean values, arguments and options can have different types. Arguments are strings by default and options are booleans by default.

Arguments and options can also be numbers.

If an option is a string or a number, you can enter the value of it after the option or with `=`. Example: `smol greet --name=Alice` or `smol greet --name Alice`. If a value has spaces, use quotes: `smol greet --name "Alice Smith"`.

Options and arguments can also be arrays. In the case of options, just enter the option multiple times: `smol greet --name Alice --name Bob --name Charlie`. If an argument is an array, just enter the values delimited by spaces: `smol greet "Alice Smith" Bob Charlie`.

# Custom Commands

See Custom Commands.
