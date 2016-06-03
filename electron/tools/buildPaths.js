export default {
   buildPath: path.join(path.resolve('../'), 'electron/build'),
   basePath: path.join(path.resolve('../'), 'electron/src'),
   actions: path.join(basePath, 'js/actions'),
   components: path.join(basePath, 'js/components'),
   constants: path.join(basePath, 'js/ants'),
   dispatchers: path.join(basePath, 'js/dispatchers'),
   stores: path.join(basePath, 'js/stores'),
   pub: path.join(basePath, 'public'),
}