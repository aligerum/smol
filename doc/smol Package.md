# smol Package

smol can be included within a script using `require('smol')` (or `import smol from 'smol').

This object has the following functions:


| Key | Value |
| --- | --- |
| array | (See Array doc) |
| color | (See Color doc) |
| colors | Console output colors (See Command doc) |
| coreJson | /core/<coreName>/core.json when running within a core |
| coreName | Name of running core as a string |
| config | (See Config doc) |
| crypt | (See Encryption doc) |
| file | (See File doc) |
| hook | (Used internally by smol cores) |
| plugins | (See Plugins doc) |
| request | (See Requests doc) |
| string | (See String doc) |

# Browser

Within a browser, `config`, `crypt`, `file`, `hook`, and `plugins` are not available.
