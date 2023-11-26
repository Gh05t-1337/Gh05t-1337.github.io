// Hase Polygon
var hase = [[7.9721469, 47.082953], [4.9242567, 35.907356], [3.5696387, 37.261975], [0.86040267, 37.261975], [0.52174867, 32.859464], [3.2309847, 31.166192000000002], [5.2629107, 31.504848000000003], [9.6654199, 24.393102000000003], [27.275455, 19.313285], [40.144325, 24.731758], [40.482979, 18.635976], [42.514907, 17.281358], [39.467016, 5.4284496], [40.482979, 1.3645957000000006], [42.853561, 4.412486100000001], [44.546833, 15.92674], [45.901452, 4.073831700000001], [48.272034, 1.0259410000000013], [49.965306999999996, 5.767104100000001], [47.933378, 17.620012000000003], [52.674541999999995, 21.345212000000004], [54.029157999999995, 26.425030000000003], [48.949341, 28.795612000000002], [44.546833, 28.118303], [42.176251, 37.261975], [39.805669, 46.06699], [36.757780000000004, 45.728336999999996], [34.048542000000005, 34.891392999999994], [30.323344000000006, 35.90735599999999], [29.984688000000006, 37.939282999999996], [28.968726000000004, 40.30986299999999], [26.936799000000004, 42.68044499999999], [22.195635000000003, 43.35775499999999], [29.646034000000004, 44.71237099999999], [25.920836000000005, 46.40564399999999]];
var hasePol = [];
for(var i=0;i<hase.length;i++){ // hase -> vector array
    hasePol.push(new Vector2(0.5+hase[i][0]/10,19.5-hase[i][1]/10).minus(new Vector2(0.5,14.8)));
}

function movePolygon(polygon,x,y){
    for (var i=0;i<polygon.length;i++){
        polygon[i].add(new Vector2(x,y));
    }
    return polygon;
}

function drawPolygon(points,fill_style,stroke_style,line_width=3){
    c.strokeStyle = stroke_style;
    c.fillStyle = fill_style;
    c.lineWidth = line_width;

    c.beginPath();
    c.moveTo(cX(points[0]), cY(points[0]));

    for(var i=1;i<points.length;i++){
        c.lineTo(cX(points[i]), cY(points[i]));
    }
    c.closePath();

    c.fill();
    c.stroke();
}

function drawLine(point1,point2,color="#000000",width=3){
    c.strokeStyle = color;
    c.lineWidth = width;

    c.beginPath();
    c.moveTo(cX(point1), cY(point1));
    c.lineTo(cX(point2), cY(point2));
    c.stroke();
}

function drawCircle(center,radius,fill_color="ff0000"){
    c.fillStyle = fill_color;

    c.beginPath();			
    c.arc(
        cX(center), cY(center), cScale * radius, 0.0, 2.0 * Math.PI); 
    c.closePath();
    c.fill();
}