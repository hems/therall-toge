<?php

	header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE");
	header("Access-Control-Allow-Headers: Accept, Authorization, Content-Type, Origin");
	header("Access-Control-Allow-Origin: http://hems.github.io");
	header("Access-Control-Allow-Origin: https://hems.github.io");
	header("Access-Control-Allow-Origin: http://localhost:3000");

	// get user URL from Wordpress custom field
	$sc_url = $_REQUEST[ 'track_url'];

	// if $sc_url is not empty, do
	if ( empty( $sc_url ) ) exit();

	echo file_get_contents( 'https://api.soundcloud.com/resolve.json?url=' . $sc_url . '&client_id=[YOUR_CLIENT_ID]' );