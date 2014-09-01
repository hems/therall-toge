<?php

$fp = fopen('http://api.soundcloud.com/tracks/' . $_REQUEST['track_id'] . '/stream?client_id=[YOUR_CLIENT_ID]', 'rb');

header("Content-Type: audio/mpeg");
header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE");
header("Access-Control-Allow-Headers: Accept, Authorization, Content-Type, Origin");
header("Access-Control-Allow-Origin: http://hems.github.io");
header("Access-Control-Allow-Origin: https://hems.github.io");
fpassthru( $fp );

exit();