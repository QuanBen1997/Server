var socket = io();
var arrayAllVariable = [];
var arrayAllDevice = [] ; 
var arrayAllVariableProperties = [] ; 
var trustList , rejectList = [] ; 

$(document).ready(() => {
  setInterval(() => {
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    $("#curentTime").html("Current Server Time : " + dateTime);
  }, 500);

  socket.on("endpoints1", (data) => {
    $("#urlEndpoints1").html(
      "Primary server endpoint url: " + " <strong>" + data + "</strong>"
    );
    let today = new Date();
    let date = today.getFullYear() + "-" +  (today.getMonth() + 1) + "-" + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    $("#timeStart").html("Server Start Time : " + dateTime);
    $('#endpointTab2').html(data) ; 
  });
  socket.on("endpoints2", (data) => {
    $("#urlEndpoints2").html(
      "Alternative server endpoint url: " + "<strong>" + data + "</strong>"
    );

    $("#serverStatus").html(
      `Server Status : <i class="fas fa-check-circle" ></i> running`
    );
  });

  socket.on('saveConfig', async (data)=>{
    $("#urlEndpoints1").html(
      "Primary server endpoint url: " + " <strong>" + data.mainUrl + "</strong>"
    );
    let today = new Date(data.dateTime) ;
    let date = today.getFullYear() + "-" +  (today.getMonth() + 1) + "-" + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    $("#timeStart").html("Server Start Time : " + dateTime);
    $("#urlEndpoints2").html(
      "Alternative server endpoint url: " + "<strong>" + data.alternativeUrl + "</strong>"
    );
    $("#serverStatus").html(
      `Server Status : <i class="fas fa-check-circle"></i> running`
    );
    $('#endpointTab2').html(data.mainUrl) ; 

    getAllVariable(data.arrayData) ; 
    getAllProperties(data.allProperties) ; 
    arrayAllVariableProperties = data.allProperties ; 
  });

  socket.on('changed1', (data)=>{
    for (let i = 0; i < data.length; i++) {
      $(`#valueOf${data[i].name}`).html(data[i].value.toString())  
    }
  }) ;

  socket.on("message", (data) => {
    $("#test").html(data);
  });

  socket.on("getDataCount", (data) => {
    $("#valueData").html(JSON.stringify(data));
  });
  
  socket.on("dataArray", (data) => {
    getAllVariable(data)
  });

  socket.on('allPropertiesVariable', (data) => {
    getAllProperties(data) ; 
  });
  var objectSessionCreate = {} ; 
  socket.on('SessionCreate', (data) => {
    objectSessionCreate = data ; 
    for(let i = 0 ; i < data.length ; i++){
      var table = document.getElementById("tableSession");
      var row = table.insertRow(0);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      var cell5 = row.insertCell(4);
      var cell6 = row.insertCell(5);
      var cell7 = row.insertCell(6);
      cell1.style.backgroundColor  = data[i].Color;
      cell2.innerHTML = data[i].TimeStamp ;
      cell3.innerHTML = data[i].EventType;
      cell4.innerHTML = data[i].SessionName;
      cell5.innerHTML = data[i].SessionId ;
      cell6.innerHTML = data[i].ClientIdentity;
      cell7.innerHTML = data[i].Secutity;
    }

    
  });
  socket.on('SessionClosed', (data) => {
    for(let i = 0 ; i < data.length ; i++){
      var table = document.getElementById("tableSession");
      var row = table.insertRow(0);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      var cell5 = row.insertCell(4);
      var cell6 = row.insertCell(5);
      var cell7 = row.insertCell(6);

      for(let j = 0 ; j < objectSessionCreate.length ; j++){
        if(objectSessionCreate[j].SessionId === data[i].SessionId){
          cell1.style.backgroundColor  = objectSessionCreate[j].Color ; 
        }
      }
      cell2.innerHTML = data[i].TimeStamp ;
      cell3.innerHTML = data[i].EventType;
      cell4.innerHTML = data[i].SessionName;
      cell5.innerHTML = data[i].SessionId ;
      cell6.innerHTML = data[i].ClientIdentity;
      cell7.innerHTML = data[i].Secutity;
    }
  });

  socket.on('tranferAgaintObjectEndpoints', (data)=>{
    for (let i = 0; i < data.securityModes.length; i++) {
      if(data.securityModes[i] === 'None'){
        addTableEndpoints(data.endpoint ,data.securityModes[i] , 'None' )
      }else{
        for(let j = 0 ; j < data.securityPolicies.length ; j++ ){
          addTableEndpoints(data.endpoint , data.securityModes[i], data.securityPolicies[j])
        }
      }
    }
  })

  socket.on('messageVariableAdded', (data)=>{
    $('#messageAddVariable').html(data.value)
    $('#messageAddVariable').css("color", data.color); 
    $('#btnAddVariable').html('Add').removeClass('disabled') ;
  })
  
  socket.on('messageVariableDeleted', (data)=>{
    $('#messageDeleteVariable').html(data.value)
    $('#messageDeleteVariable').css("color", data.color)
    $('#btnDeleteVariable').html('Add').removeClass('disabled') ;
  }) 

  socket.on('messageVariableUpdated' , (data)=>{
    $('#messageUpdateVariable').html(data.value)
    $('#messageUpdateVariable').css("color", data.color)
    $('#btnUpdateVariable').html('Add').removeClass('disabled') ;
  })

  socket.on('startServer', (data)=>{
    $('#btnApply').html('Apply').removeClass('disabled') ;
    $('#messageApplyServer').html(data.message).css('color', data.color)
  })

  socket.on('ackAddUser', (data)=>{
    $('#finishAddUser').html(data.message) ; 
    $('#finishAddUser').css("color", data.color);
    $('#addUser').html('Add').removeClass('disabled') ;
    var stringUser = ''; 
    for(let i = 0 ; i < data.listUser.length ; i ++){
       stringUser += `<li class="list-group-item"> ${data.listUser[i].user}</li>` ; 
    } 
    $('#listUser').html(stringUser) ; 
  })

  socket.on('ackDeleteUser', (data)=>{
    $('#finishDeleteUser').html(data.message) ; 
    $('#finishDeleteUser').css("color", data.color) ; 
    $('#deleteUser').html('Delete').removeClass('disabled') ;
    var stringUser = ''; 
    for(let i = 0 ; i < data.listUser.length ; i ++){
      stringUser  += `<li class="list-group-item"> ${data.listUser[i].user}</li>`
    } 
    $('#listUser').html(stringUser) ; 
  }) ;
  socket.on('loadUser', (data)=>{
    var stringUser = '' ; 
    for(let i = 0 ; i < data.listUser.length ; i ++){
      stringUser  += `<li class="list-group-item"> ${data.listUser[i].user}</li>`
    } 
    $('#listUser').html(stringUser) ; 
  })
  
socket.on('loadListTrusted', (data)=>{
    trustList = data.map(function(element){
    return element.slice(0,10)
    }) ;
    var htmlString = ''
    for(let i = 0 ; i < data.length ; i ++){
      htmlString += `<li class="list-group-item" id = "parent${trustList[i]}" > ${data[i]} <button type="button" 
      class="btn btn-secondary" id = "btn${trustList[i]}"> Reject </button> </li>`
    } ;
    $('#listTrust').html(htmlString) ;
    for(let i = 0 ; i < trustList.length ; i++){
      $(`#btn${trustList[i]}`).click(function(){
       socket.emit('moveToReject', data[i]) ;
       $(`#parent${trustList[i]}`).remove() ; 
       $('#listReject').append(`<li class="list-group-item"> ${data[i]} </li>`) ;
       }) ;
    }  
  }) ;
    
socket.on('loadListRejected',(data)=>{
   rejectList = data.map(function(element){
    return element.slice(0,10)
    }) ; 
   var htmlString = ''
    for(let i = 0 ; i < data.length ; i ++){
      htmlString += `<li class="list-group-item" id = "parent${rejectList[i]}" > ${data[i]} <button type="button" 
      class="btn btn-secondary" id = "btn${rejectList[i]}"> Trust </button>  </li>`
    } ;
    $('#listReject').html(htmlString) ; 
    for(let i = 0 ; i  < rejectList.length ; i++){
      $(`#btn${rejectList[i]}`).click(function(){
        socket.emit('moveToTrust', data[i]) ;
        $(`#parent${rejectList[i]}`).remove() ; 
        $('#listTrust').append(`<li class="list-group-item" > ${data[i]} </li>`)
      }) ;
    }
})

socket.on('responseServer', (data)=>{
  $('#messageShuttdownServer').html(data.message).css('color', data.color) ;
  $('#btnShuttdown').html('Shut down Server').removeClass('disabled') ;
})

});

function getAllProperties(data){
  for (const iterator of data) {
    $(`#${iterator.properties.name}`).dblclick(function () {
      var len = $('#myTable >tr').length ; 
      var table = document.getElementById("myTable");
      var row = table.insertRow(len);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      cell4.id = `valueOf${iterator.properties.name}`; // value of Data
      var cell5 = row.insertCell(4);
      var cell6 = row.insertCell(5);
      var cell7 = row.insertCell(6);
      var cell8 = row.insertCell(7);
      cell1.innerHTML = len + 1;
      cell2.innerHTML = iterator.properties.nodeId ;
      cell3.innerHTML = iterator.properties.name;
      cell5.innerHTML = iterator.properties.dataType;
      cell6.innerHTML = getTime(new Date()) ;
      cell7.innerHTML = iterator.properties.writable;
      cell8.innerHTML =
        "<button type='button'" +
        "onclick= 'productDelete(this) ;' " +
        "class='btn btn-secondary'>" +
        "Delete" +
        "</button>";
    }); 
  }
}
function productDelete(ctl) {
  $(ctl).parents("tr").remove();
}

function getAllVariable(data){
    arrayAllVariable = data.slice(1, data.length);
    var arrayDevice = data.shift();
    arrayAllDevice = arrayDevice ; 

    for (var i = 0; i < arrayDevice.length; i++) {
      $("#allDevice").append(
        `<li class="nav-item">              
      <a
        class="nav-link collapsed py-1"
        href="#"
        data-toggle="collapse"
        data-target="#${arrayDevice[i]}"
        ><span>${arrayDevice[i]}</span></a>
      <div
        class="collapse"
        id="${arrayDevice[i]}"
        aria-expanded="false"
      >
      <ul class="flex-column nav pl-4" id="${arrayDevice[i]}Item" >

      </ul>
      </div>
    </li>`
      );
      for (var j = 0; j < data[i].length; j++) {
        $(`#${arrayDevice[i]}Item`).append(`
        <li class="nav-item" id = "${arrayDevice[i]}-${data[i][j]}"  >
        <a class="nav-link p-1" href="#" id="${data[i][j]}" > ${data[i][j]} </a>
      </li>`);
      }
    }
    //console.log(arrayAllVariable);
}

function Writevariable(){
  socket.emit('WriteVariable' , {nameVariable: 'count1' , value: $('#writeValue').val() }  )
  console.log('ok')
}

var options = {};
function ChangeInput1() {
  $("#endpointTab2").html("opc.tcp://DESKTOP-LOTC86T:" + $("#portName").val());
}
function ChangeInput2() {
  $("#endpointTab2").html(
    "opc.tcp://DESKTOP-LOTC86T:" +
      $("#portName").val() +
      "/" +
      $("#serverName").val()
  );
}
function SettingUrl() {
  $('#btnApply').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Applying...').addClass('disabled')
  options.port = parseInt($("#portName").val());
  options.resourcePath = "/" + $("#serverName").val();
  options.securityModes = [];
  if ($("#securityModeNone").prop("checked")) {
    options.securityModes.push("opcua.MessageSecurityMode.None");
  }
  if ($("#securityModeSign").prop("checked")) {
    options.securityModes.push("opcua.MessageSecurityMode.Sign");
  }
  if ($("#securityModeSignEncrypt").prop("checked")) {
    options.securityModes.push("opcua.MessageSecurityMode.SignAndEncrypt");
  }
  options.securityPolicies = [];

  if ($("#securityPoliciesNone").prop("checked")) {
    options.securityPolicies.push("opcua.SecurityPolicy.None");
  }
  if ($("#securityPoliciesBasic128Rsa15").prop("checked")) {
    options.securityPolicies.push("opcua.SecurityPolicy.Basic128Rsa15");
  }
  if ($("#securityPoliciesBasic256").prop("checked")) {
    options.securityPolicies.push("opcua.SecurityPolicy.Basic256");
  }
  if ($("#securityPoliciesBasic256Sha256").prop("checked")) {
    options.securityPolicies.push("opcua.SecurityPolicy.Basic256Sha256");
  }
  if ($("#anonymous").prop("checked")) {
    options.allowAnonymous = true;
  }
  if ($("#authenticationUser").prop("checked")) {
    options.allowAnonymous = false;
    options.user = $("#usernameUser").val();
    options.password = $("#passwordUser").val();
  }
  socket.emit("optionsOPC", options);
  $(".container-fluid").removeAttr("style");
  setTimeout(() => {
    showAllEndpoints() ; 
  }, 1000);
}

function AuthenticationSetting() {
  if ($("#anonymous").prop("checked")) {
    $("#usernameUser").prop("disabled", true);
    $("#passwordUser").prop("disabled", true);
    $("#authenticationUser").prop("disabled", true);
  } else {
    $("#usernameUser").prop("disabled", false);
    $("#passwordUser").prop("disabled", false);
    $("#authenticationUser").prop("disabled", false);
  }
}

function DisableAnonymous() {
  if ($("#authenticationUser").prop("checked")) {
    $("#anonymous").prop("disabled", true);
  } else {
    $("#anonymous").prop("disabled", false);
  }
}

function addVariable(){
  let value  ; 
  if($('#addValueOfVariable').val()==='true' || $('#addValueOfVariable').val()=='false'){
     if($('#addValueOfVariable').val()==='true'){
       value = true ; 
     }else{
       value = false ; 
     }
  }else{
    value =  $('#addValueOfVariable').val() ; 
  }
  if($('#addDevicenameOfVariable').val() === '' || $('#addBrowerNameOfVariable').val() === '' || $('#addValueOfVariable').val() === '' ){
    $('#messageAddVariable').html('Please fill out !').css('color', 'red') ; 
  }else{
    let Data = {Devicename: $('#addDevicenameOfVariable').val() ,
    browerName:  $('#addBrowerNameOfVariable').val()  ,
    nodeId:  'ns=1;s="' + $('#addDevicenameOfVariable').val()  + '"."' + $('#addBrowerNameOfVariable').val() + '"'  , 
    dataType:  $('#addDataTypeOfVariable').val()  ,
    value:  value,
    writeable:  $('#addWriteableOfVariable').val() } ;
    setTimeout(() => {
      socket.emit('add',Data) ;
    }, 1000);
  $('#btnAddVariable').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Adding...').addClass('disabled');
  }
}

function deleteVariable() {
  if($('#deleteDevicenameOfVariable').val() === '' || $('#deleteBrowerNameOfVariable').val() === '' ){
    $('#messageDeleteVariable').html('Please fill out !').css('color', 'red') ; 
  }else{
    let Data = {Devicename: $('#deleteDevicenameOfVariable').val() ,
    browerName:  $('#deleteBrowerNameOfVariable').val() 
   } ; 
   setTimeout(() => {
     socket.emit('delete', Data) ; 
   }, 1000);
    $('#btnDeleteVariable').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Deleting...').addClass('disabled');
  }
}
function updateVariable(){
  let value  ; 
  if($('#updateValueOfVariable').val()==='true' || $('#updateValueOfVariable').val()==='false'){
     if($('#updateValueOfVariable').val()==='true'){
       value = true ; 
     }else{
       value = false ; 
     }
  }else{
    value =  $('#updateValueOfVariable').val() ; 
  }
  if($('#updateDevicenameOfVariable').val() === '' || $('#updateBrowerNameOfVariable').val() === '' || $('#updateValueOfVariable').val() ===''){
    $('#messageUpdateVariable').html('Please fill out !').css('color', 'red') ; 
  }else{
    let Data = {Devicename: $('#updateDevicenameOfVariable').val() ,
    browerName:  $('#updateBrowerNameOfVariable').val()  ,
    nodeId:  'ns=1;s="' + $('#updateDevicenameOfVariable').val()  + '"."' + $('#updateBrowerNameOfVariable').val() + '"'  , 
    dataType:  $('#updateDataTypeOfVariable').val()  ,
    value:  value ,
    writeable:  $('#updateWriteableOfVariable').val() } ;
    setTimeout(() => {
      socket.emit('update',Data) ; 
    }, 1000); 
    $('#btnUpdateVariable').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Updating...').addClass('disabled');
  }
 }

$('#addUser').click( function(){
  let Data = {
    user: $('#addUsername').val() ,
    password: $('#addPassword').val()
  }
  setTimeout(() => {
  socket.emit('addUserAndPass', Data) ; 
  }, 1000);
  $('#addUser').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>').addClass('disabled');
})
$('#deleteUser').click (function() { 
  setTimeout(() => {
  socket.emit('deleteUser', { user: $('#delUsername').val() }) ; 
  }, 1000);
  $('#deleteUser').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>').addClass('disabled')
 })
function showAllEndpoints() { 
  let ObjectOfTable = { endpoint: $('#endpointTab2').text() , securityModes: [] , securityPolicies: [] } 
  if($('#securityModeNone').prop('checked')){
    ObjectOfTable.securityModes.push('None') ; 
  }
  if($('#securityModeSign').prop('checked')){
    ObjectOfTable.securityModes.push('Sign') ; 
  }
  if($('#securityModeSignEncrypt').prop('checked')){
    ObjectOfTable.securityModes.push('SignAndEncrypt') ; 
  }
  if($('#securityPoliciesBasic128Rsa15').prop('checked')){
    ObjectOfTable.securityPolicies.push('Basic128Rsa15') ; 
  }
  if($('#securityPoliciesBasic256').prop('checked')){
    ObjectOfTable.securityPolicies.push('Basic256') ; 
  }
  if($('#securityPoliciesBasic256Sha256').prop('checked')){
    ObjectOfTable.securityPolicies.push('Basic256Sha256') ; 
  }
  for (let i = 0; i < ObjectOfTable.securityModes.length; i++) {
    if(ObjectOfTable.securityModes[i] === 'None'){
      addTableEndpoints(ObjectOfTable.endpoint ,ObjectOfTable.securityModes[i] , 'None' )
    }else{
      for(let j = 0 ; j < ObjectOfTable.securityPolicies.length ; j++ ){
        addTableEndpoints(ObjectOfTable.endpoint , ObjectOfTable.securityModes[i], ObjectOfTable.securityPolicies[j])
      }
    }
  }
  socket.emit('allEndpoints' , ObjectOfTable ) ; 
 }
 function addTableEndpoints(a,b,c){
  var table = document.getElementById("tableEndpointModal");
  var row = table.insertRow(0);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  cell1.innerHTML = a;
  cell2.innerHTML = b;
  cell3.innerHTML = c;
 }

function getTime(data){
  let today = data;
  let date = today.getFullYear() + "-" +  (today.getMonth() + 1) + "-" + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return dateTime = date + " " + time;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// function refreshData(){
//   socket.emit('refresh', 'refresh ok') ;
// }

function shuttdown(){
  $('#btnShuttdown').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Shutting down...').addClass('disabled')
  socket.emit('shuttdownServer' , 'ok') ; 
}

