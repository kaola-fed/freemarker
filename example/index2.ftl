<!DOCTYPE html>
<html>
  <head>
    [#include "/common/function2.ftl"]
    <meta charset="utf-8">
    <title>freemarker test</title>
  </head>
  <body>
    <h1>${title}</h1>
    <script>
      window.config = {
        test1: ${stringify(test1)},
        test2: ${stringify(test2)},
        test3: ${stringify(test3)},
      };
    </script>
  </body>
</html>
