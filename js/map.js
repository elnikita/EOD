//Esta variable ya se declaro en el index.html
mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc2NvbGVpdmE5NCIsImEiOiJjamViY29uZ2wwOWR4MndvMmdqeDhpZG1tIn0.kMbJ-Yvs7BrctociyrTDRw';

var geojson;

var marker_single=null;

var map;

var list = [];
// Se llama a la funcion que carga el mapa
cargarMapa();

//Si alguien viene al index con un marcador en la URL
//esta funcion se encarga de obtener esa variable y su valor
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }


    }
};

//Se cargan los datos desde firebase
cargarDatosFirebase();


//Esta funcion tiene que cambiarse para llenar
//de mejor forma la lista que contiene los marcadores
function cargarDatosFirebase() {

firebase.database().ref('books/features').on('value', function(snapshot) {

    geojson=snapshot;
    snapshot.forEach(function (childSnapshot) {


          var value = childSnapshot.val();
          console.log("El ID del marcador es: " + value.id);
          var coordenadas=  value.geometry.coordinates;
          list.push({ id: value.id, nombre: value.properties.message, coordenadas: coordenadas, productos:value.properties.products, imagen:value.properties.imagen});


          if(marker_single===null){

             marker_single=value;
             primerMarcador();
          }

      		set_informacion(value);


    });

    CargarLista();

// add markers to map


});
}

function CargarLista(){

list.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre> a.nombre) ? -1 : 0));
list.forEach(function(element) {


              var newDiv = document.createElement("li");
                // and give it some content

              newDiv.classList.add("list-group-item");


              var newContent = document.createElement("a");

              newContent.textContent= element.nombre;
                // add the text node to the newly created div
              newDiv.append(newContent);

              $('#myUL').append(newDiv);

              console.log(element);

              });

              $("#myUL li").click(function() {


                  var search= search2(this.innerText, list);
                  let obj = list.find(obj => obj.id == search);
                  console.log(obj.productos);
                  DetailSection(obj);

              });

}

function DetailSection(obj){



                map.flyTo({center:obj.coordenadas});

			          $('#marker_nombre').html(obj.nombre);
                var src1 = 'Images/' + obj.imagen;
                $("#gmaps_container").show();


                $("#a_gmaps").attr("href", "https://www.google.com/maps/?q="+obj.coordenadas);
                $("#marker_img").attr("src", src1);



                if(obj.productos===null){




                }else{

                      $('#ul_productos').empty();
                      ProductosxTramo(obj);



                }
}



//Se selecciona el primer marcador. Se muestran sus datos
//Y se ubica el foco del mapa en la coordenada del marcador
function primerMarcador() {

        var coordenadas=  marker_single.geometry.coordinates[1].toString()+"," + marker_single.geometry.coordinates[0].toString();
        $('#marker_nombre').html(marker_single.properties.message);
        var src1 = 'Images/' + marker_single.properties.imagen;
        $("#gmaps_container").show();
        $("#a_gmaps").attr("href", "https://www.google.com/maps/?q="+coordenadas);
        $("#marker_img").attr("src", src1);

        map.flyTo({center:marker_single.geometry.coordinates});

if(marker_single.properties.products===null){


}else{


let obj = list.find(obj => obj.id == marker_single.id);

$('#ul_productos').empty();

ProductosxTramo(obj);
}
}

//Esta funcion se encarga de buscar si hay una variable en la URL
// y muestra el marcador y sus detalles
function luegodeCarga(){

var buscar= getUrlParameter("marcador");

if (buscar === undefined || buscar === null) {

  primerMarcador();

    }
else{

  var needle = buscar;

  $.each(geojson.features, function(i, v) {
        if (v.id == buscar) {
            marker_single=v;
         //   primerMarcador();
        map.flyTo({center:v.geometry.coordinates});

    }
  });
    }

}

function set_item(marker){

  var coordenadas=  marker.geometry.coordinates[1].toString()+"," + marker.geometry.coordinates[0].toString();
  map.flyTo({center:marker.geometry.coordinates});
}

//Esta llena la seccion de detalles con la informacion del marcador.
function set_informacion(marker){

 // create a DOM element for the marker
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(Images/' + marker.properties.imagen + ')';
    el.style.width = marker.properties.iconSize[0] + 'px';
    el.style.height = marker.properties.iconSize[1] + 'px';
    var mensaje= 'Images/' + marker.properties.imagen + ')';

    el.addEventListener('click', function() {


                var coordenadas=  marker.geometry.coordinates[1].toString()+"," + marker.geometry.coordinates[0].toString();
                map.flyTo({center:marker.geometry.coordinates});
                $('#marker_nombre').html(marker.properties.message +marker.id );
                var src1 = 'Images/' + marker.properties.imagen;
                $("#gmaps_container").show();
                $("#a_gmaps").attr("href", "https://www.google.com/maps/?q="+coordenadas);
                $("#marker_img").attr("src", src1);



                if(marker.properties.products===null){




                }else{



                  let obj = list.find(obj => obj.id == marker.id);

                  $('#ul_productos').empty();
ProductosxTramo(obj);
                    }

                }

    );

 new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
}

function ProductosxTramo(obj){

                        $('#ul_productos').empty();
                        $.each(obj.productos, function(i, v) {




                              var txt2= document.createElement("li");


                              txt2.classList.add("list-group-item2");

                              txt2.textContent= v.nombre;

                              var txtspan= document.createElement("span");
                              txtspan.textContent=v.precio;
                              txtspan.classList.add("spanPrice");
                              txt2.append(txtspan);

                              $('#ul_productos').append(txt2);



                        });



}
//Esta funcion crea el objeto mapa y le asigna sus atributos y propiedades
function cargarMapa(){


  //Se inicia el objeto Mapa
 map = new mapboxgl.Map({

      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-86.26040264311852,
          12.145426544276077],
      zoom: 19,
  });

  // disable map rotation using right click + drag
  map.dragRotate.disable();
  // disable map rotation using touch rotation gesture
  map.touchZoomRotate.disableRotation();
  // se añaden los controles de navegacion
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-left');

}


function myFunction() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('myInput');
  filter = input.value.toUpperCase();
  ul = document.getElementById("myUL");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function search2(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {

	var x= myArray[i].nombre.trim().toLowerCase();
	var y = nameKey.trim().toLowerCase();

		console.log( x+ " - " +y);

	var value1 = x.localeCompare(y);

	console.log(value1);

	if (value1==0){
	return myArray[i].id;
	}

    }
}
