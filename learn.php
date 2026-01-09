<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

function myErrorHandler($errno, $errstr, $errfile, $errline)
{
    echo ("<b style='color:red;'>ERROR</b> [$errno] (line $errline): $errfile.  $errstr");
}
// set to the user defined error handler
set_error_handler("myErrorHandler");

function printNice($a, string $b = '')
{
    if (is_array($a)) {
        $a = json_encode($a);
    }
    $output = '    ' . ' <span style="color:blue;">' . $b . '</span>  ' . $a . ' ' . "\n\r";
    echo $output;
}


///////////////////////

$html = '';


//  user asked for a specific file?
if (empty($_REQUEST)) {
    if (!file_exists('./build/learn_three')) {
        echo "Run the typescript compiler first:  <tt style='color:blue;'>tsc</tt> (or <tt style='color:blue;'>tsc -w</tt>  in watch mode);";
        return;
    }
    // no - show list of files in src directory
    $files = scandir("./build/learn_three");
    foreach ($files as $file) {
        // echo $file,'<br>';
        if ($file == '.' or $file == '..')  // don't want these
            continue;
        if (substr($file, -3, 3) !== '.js')    // only .js files
            continue;

        $html .= "<a href='?$file';'>$file</a><br>";
    }
} else {  // home
    $file = array_key_first($_REQUEST);
    if ($file == 'makehtml') {
        // check if we can write

        // create the html file and write as 'index.html'
        $html .= htmlHeader();
        $keys = array_keys($_REQUEST);
        $file = $keys[1];   // the filename is in the second position
        $file = str_replace('_js', '.js', $file);
        $html .= htmlBody($file);
        $html =  htmlentities($html);
        $html = str_replace("\n", '<br>', $html);
        echo $html;
        return; // all done
    } else {
        $html .= htmlHeader();
        $html .= "\n<button href =button type='button' onclick='window.location.href = \"? \";'>Home</button>&nbsp;";
        $html .= "\n<button href =button type='button' onclick='window.location.href = \"?makehtml&$file \";'>HTML Boilerplate</button><br><br>";
        $file = str_replace('_js', '.js', $file);
        $html .= htmlBody($file);
    }
}
echo $html;


function htmlHeader()
{
    $html =
        '<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Three</title>

            <script type="importmap">
                    {
                      "imports": {
                        "three": "http://localhost/jsx2/node_modules/three/build/three.module.js",
                        "three/addons/": "http://localhost/jsx2/node_modules/three/examples/jsm/"
                      }
                    }
        </script>
        </head>';
    return $html;
}
function htmlBody($sFile)
{
    $html =
        "    <body>
		<canvas class='webgl'></canvas>
		<script type='module' src='/jsx2/build/learn_three/$sFile'></script>
	</body>
</html>";

    return $html;
}
