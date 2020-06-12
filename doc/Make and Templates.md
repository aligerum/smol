# Make and Templates

In order to be able to rapidly develop apps, smol provides a template system that can be accessed using the `make` command.

Each core (and smol itself) provides template files that you can make new files from quickly. For example, it is common within express to need to make a new controller.

```js
$ smol make core express api
Created express core at core/api

$ smol make api controller user
Created core/api/controller/user.js

$ smol make api controller post
Created core/api/controller/post.js

$ smol make api controller image
Created core/api/controller/image.js
```

Here, we have used `make core` to make an express core called "api" (see make core command documentation). Then we created 3 controllers, one for users, another for posts, and another for images. These controller files already have basic REST functions you may immediately start adding functionality to.

You may also make things outside of the scope of a specific core, such as custom commands. For these, don't specify a core name, for example `smol make command doStuff`. See make command documentation for a list of available templates.

See make core and make config documentation for more information.

# Custom Templates

You may have templates you'd like to make files from for your project. For this, you can create your own custom make files.

Creating things with make files involves a single make file and 0 or more template files. The make file defines which templates should be loaded, what data within the templates should be replaced, and where the newly generated file should be stored.

For example, let's say we're making a card game app, and we want to store each card in an individual json file in a `data/card` directory. Each card follows a similar template. You could run `smol make make card`, then we can edit the template file to have the schema our cards should have.

```
$ smol make make card
Created make/card.js
Created template/card.js
Created template/card.example.js
```

This automatically created .js templates, but you can use any kind of file to be a template. In this case, we'll rename `card.js` and `card.example.js` to `card.json` and `card.example.json`. Now we can edit `template/card.json`:

```json
{
  "name": "cardName",
  "health": 0,
  "element": "",
  "tags": [],
  "abilities": [
  ]
}
```

Now we'll make the example as well:

```json
{
  "name": "cardName",
  "health": 20,
  "element": "fire",
  "tags": ["fire", "lizard"],
  "abilities": [
    {
      "name": "flamethrower",
      "type": "attack",
      "element": "fire",
      "damage": 5
    }
  ]
}
```

Now we can edit the make file at `make/card.js`.

```js
const smol = require('smol')

module.exports = {
  description: 'Card definition',
  files: [
    {
      from: 'card.json',
      fromExample: 'card.example.json',
      to: filename => `data/card/${smol.string.camelCase(filename)}.json`,
      parse: template => {
        return smol.string.replace(template.content, {
          cardName: smol.string.spaceCase(template.filename)
        })
      },
    }
  ],
}
```

The description is used when getting a description of the make using `smol help make`. In this case, the help would show this:

```
Custom Templates
  card          Card definition
```

You can then define a list of files. Each time you run a make, it can pull from multiple templates to create multiple files. In this case, we're just creating a single json file. It can pull from a different template when `smol make card --example` is called. If this key is not defined, it will fall back to the normal template file. This path is relative to `projectRoot/template/`.

The `to` key is a function that is passed the filename, so if a user typed `smol make card zombie`, it would create `data/card/zombie.json`. You can do whatever you want with the filename, and keep in mind users can type spaces, so if you wanted to, you could use `smol.string.kabobCase(filename)` to create `data/card/cursed-winged-guardian.json` when `smol make card "Cursed Winged Guardian"` is run. This key is relative to `projectRoot/` and any files created will automatically have their parent directories generated if they don't exist.

The `parse` function is an optional function that is passed a `template` object. This object has a `content` key on it that is a string of the loaded template's file content. This function returns whatever content you want to be saved to the newly created file. In this case, we replace `$cardName` with a spaceCase version of it. For example `smol make card fallen-warrior` would have the name "Fallen Warrior" in the json.

The template object also has an `isExample` key and a `filename` key, which is the original filename passed in (not the returned value from the `to` function).

You can also use the `parse` function to create files entirely procedurally without using a template. Omit the `from` and/or `fromExample` keys, and an empty string will be passed in.

When developing a new core type, the `template` object also has a `core` key containing the name of the targeted core.

Note that files generated by the make system are for convenience. It is expected that the created file will still need to be manually edited by the user.
