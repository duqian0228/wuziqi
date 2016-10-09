$(function(){
  var container=$(".container");
  var height=$(window).height();
  var begin=$(".begin-btn");
  var chessboard=$("#chessboard").get(0);
  var ctx=chessboard.getContext("2d");
  var ROW=15;
  var width=chessboard.width;
  var off=width/ROW;
  var button_type=$(".button-type");
  var ai=false;
  var flag=true;
  var blocks={};
  var blank={};
  for(var i=0;i<15;i++){
    for(var j=0;j<15;j++){
      blank[p2k(i,j)]=true;
    }
  }
  // var chess=$(".chess");
  // chess.css({'width':+width,'height':+width});
  button_type.on("click",function(){
    $(".play-dom").toggleClass("dom");
    $(".play-type").toggleClass("play-type-show");
  });
  container.css("height",height);
  begin.on("click",function(){
    $(".curtain").addClass("curtain-play");
    $(".begin").addClass("begin-play");
    $(chessboard).addClass("chessboard-show");
    $(".button-list").addClass("button-show");
    $(".chess-box").addClass("chess-box-show");
  });

  //传入x,y 坐标，转换成 "x_y"的形式
  function p2k(x,y){
    return x+"_"+y;
  }
  // 将 {x: ,y:}的形式转换成键名
  function o2k(position){
    return position.x+"_"+position.y;
  }
  //将键名的形式转换成 {x: ,y:} 的形式
  function p2o(position){
    var pos={x:parseInt(position.split("_")[0]),y:parseInt(position.split("_")[1])};
    return pos;
  }
  //画棋盘
  function drawChessboard(){
    ctx.save();
    ctx.beginPath();
    for(var i=0;i<ROW;i++){
      ctx.moveTo(0.5*off,0.5*off+i*off);
      ctx.lineTo(14.5*off,0.5*off+i*off);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    for(var i=0;i<ROW;i++){
      ctx.moveTo(0.5*off+i*off,0.5*off);
      ctx.lineTo(0.5*off+i*off,14.5*off);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    drawCircle(3.5,3.5);
    drawCircle(11.5,3.5);
    drawCircle(7.5,7.5);
    drawCircle(3.5,11.5);
    drawCircle(11.5,11.5);
  }
  //画棋盘上的小原点
  function drawCircle(x,y){
    ctx.beginPath();
    ctx.arc(x*off,y*off,4,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
  }
  //在每颗棋子上写数字
  function drawtext(pos,text,color){
    ctx.save();
    ctx.font="15px 微软雅黑";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    if(color==="black"){
      ctx.fillStyle="#fff";
    }else if(color==="white"){
      ctx.fillStyle="#000";
    }
    ctx.fillText(text,(pos.x+0.5)*off,(pos.y+0.5)*off);
    ctx.restore();
  }
  //绘制棋谱
  function review(position){
    var i=1;
    for(var pos in blocks){
      // console.log()
      drawtext(p2o(pos),i,blocks[pos]);
      i++;
    }
  }
  drawChessboard();
  //绘制每颗棋子
  function drawChess(position,color){
    ctx.save();
    ctx.beginPath();
    ctx.translate((position.x+0.5)*off,(position.y+0.5)*off);
    if(color==="black"){
      var radgrad = ctx.createRadialGradient(-3,-3,2,0,0,15);
      radgrad.addColorStop(0, '#fff');
      radgrad.addColorStop(0.5, '#000');
      ctx.fillStyle=radgrad;
    }else{
      ctx.shadowOffsetX=3;
      ctx.shadowOffsetY=3;
      ctx.shadowBlur=7;
      ctx.shadowColor="#000";
      ctx.fillStyle="#fff";
    }
    ctx.arc(0,0,15,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    blocks[position.x+"_"+position.y]=color;
    delete blank[position.x+"_"+position.y];
  }   //{x,y}
  //检测相同棋子的个数
  function check(pos,color){
    var num=1;
    var num1=1;
    var num2=1;
    var num3=1;
    var table={};
    for(var i in blocks){
      if(blocks[i]===color){
        table[i]=true;
      }
    }

    //判断横向的棋子个数
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx+1+"_"+ty]){
      num++;
      tx++;
    }
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx-1+"_"+ty]){
      num++;
      tx--;
    }

    //判断纵向的棋子个数
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx+"_"+(ty+1)]){
      num1++;
      ty++;
    }
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx+"_"+(ty-1)]){
      num1++;
      ty--;
    }
    //判断右上，左下的棋子个数
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx+1+"_"+(ty-1)]){
      num2++;
      tx++;
      ty--;
    }
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx-1+"_"+(ty+1)]){
      num2++;
      tx--;
      ty++;
    }
    //判断右下，左上的棋子个数
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx+1+"_"+(ty+1)]){
      num3++;
      tx++;
      ty++;
    }
    var tx=pos.x;
    var ty=pos.y;
    while(table[tx-1+"_"+(ty-1)]){
      num3++;
      tx--;
      ty--;
    }
    var max=Math.max(num,num1,num2,num3);
    return max;
  }
  function handleClick(e){
    var t=0;
    var position={
      x:Math.round((e.offsetX-off/2)/off),
      y:Math.round((e.offsetY-off/2)/off)
    };
    if(ai){
      drawChess(position,"black");
      if(check(position,"black")>=5){
        $(".win-black").addClass("black-win")
            .delay(1000)
            .queue(function(){
              $(".sure-btn").css("display","block");
              $(this).removeClass("black-win").dequeue();
              $(".sure-btn .sure").on("click",function(){
                $(".sure-btn").css("display","none");
                review();
              });
              $(".sure-btn .not").on("click",function(){
                $(".sure-btn").css("display","none");
                $(".not-replay").css("display","block")
                    .on("click",function(){
                      $(".cue-replay").addClass("cue-show")
                          .delay(1000)
                          .queue(function(){
                            $(this).removeClass("cue-show").dequeue();
                          });
                      $(".not-replay").css("display","none");
                      ctx.clearRect(0,0,width,width);
                      drawChessboard();
                      blocks={};
                      $(chessboard).off('click').on("click",handleClick);
                      ai=false;
                      flag=true;
                    });
                return;
              });
            });
        $(this).off("click");
        return;
      }else{
        drawChess(p2o(AI()),"white");
        if(check(p2o(AI()),"white")>5){
          $(".win-white").addClass("white-win")
              .delay(1000)
              .queue(function(){
                $(this).removeClass("white-win").dequeue();
                $(".sure-btn").css("display","block");
                $(".sure-btn .sure").on("click",function(){
                  $(".sure-btn").css("display","none");
                  review();
                });
                $(".sure-btn .not").on("click",function(){
                  $(".sure-btn").css("display","none");
                  $(".not-replay").css("display","block")
                      .on("click",function(){
                        $(".cue-replay").addClass("cue-show")
                            .delay(1000)
                            .queue(function(){
                              $(this).removeClass("cue-show").dequeue();
                            });
                        $(".not-replay").css("display","none");
                        ctx.clearRect(0,0,width,width);
                        drawChessboard();
                        blocks={};
                        $(chessboard).off('click').on("click",handleClick);
                        ai=false;
                        flag=true;
                      });
                  return;
                });
              });
          $(this).off("click");
          return;
        }
      }
      return;
    }
    if(blocks[o2k(position)]){
      return;
    }
    if(flag){
      drawChess(position,"black");
      // $(".black-chess").addClass("active").css({'top':+(position.x+0.5)*off,'left':+(position.x+0.5)*off});
      t=setInterval(function(){
      },1000);
      if(check(position,"black")>=5){
        $(".win-black").addClass("black-win")
            .delay(1000)
            .queue(function(){
              $(".sure-btn").css("display","block");
              $(this).removeClass("black-win").dequeue();
              $(".sure-btn .sure").on("click",function(){
                $(".sure-btn").css("display","none");
                review();
              });
              $(".sure-btn .not").on("click",function(){
                $(".sure-btn").css("display","none");
                $(".not-replay").css("display","block")
                    .on("click",function(){
                      $(".cue-replay").addClass("cue-show")
                          .delay(1000)
                          .queue(function(){
                            $(this).removeClass("cue-show").dequeue();
                          });
                      $(".not-replay").css("display","none");
                      ctx.clearRect(0,0,width,width);
                      drawChessboard();
                      blocks={};
                      $(chessboard).off('click').on("click",handleClick);
                      ai=false;
                      flag=true;
                    });
                return;
              });
            });

        $(this).off("click");
        return;
      }
    }else{
      drawChess(position,"white");
      if(check(position,"white")>=5){
        $(".win-white").addClass("white-win")
            .delay(1000)
            .queue(function(){
              $(this).removeClass("white-win").dequeue();
              $(".sure-btn").css("display","block");
              $(".sure-btn .sure").on("click",function(){
                $(".sure-btn").css("display","none");
                review();
              });
              $(".sure-btn .not").on("click",function(){
                $(".sure-btn").css("display","none");
                $(".not-replay").css("display","block")
                    .on("click",function(){
                      $(".cue-replay").addClass("cue-show")
                          .delay(1000)
                          .queue(function(){
                            $(this).removeClass("cue-show").dequeue();
                          });
                      $(".not-replay").css("display","none");
                      ctx.clearRect(0,0,width,width);
                      drawChessboard();
                      blocks={};
                      $(chessboard).off('click').on("click",handleClick);
                      ai=false;
                      flag=true;
                    });
                return;
              });
            });
        $(this).off("click");
        return;
      }
    }
    flag=!flag;
  }

  function AI(){
    var grade1=-Infinity;
    var black={};
    var grade2=-Infinity;
    var white={};
    for(var pos in blank){
      if(grade1<check(p2o(pos),"black")){
        grade1=check(p2o(pos),"black");
        black=pos;        //x_y
      }
      if(grade2<check(p2o(pos),"white")){
        grade2=check(p2o(pos),"white");
        white=pos;        //x_y
      }
    }
    if(grade1>=grade2){
      return black;
    }else{
      return white;
    }
  }

  $(".play").on("click",function(){
    $(".win-white").removeClass("white-win");
    $(".win-black").removeClass("black-win");
    $(".cue-play").addClass("cue-show")
        .delay(1000)
        .queue(function(){
          $(this).removeClass("cue-show").dequeue();
        });
    ctx.clearRect(0,0,width,width);
    ai=false;
    drawChessboard();
    blocks={};
    $(chessboard).on("click",handleClick);
    flag=true;
  });
  $(".people").on("click",function(){

    $(".cue-people").addClass("cue-show")
        .delay(1000)
        .queue(function(){
          $(this).removeClass("cue-show").dequeue();
        });
    ctx.clearRect(0,0,width,width);
    ai=false;
    drawChessboard();
    blocks={};
    $(chessboard).off('click').on("click",handleClick);
  });
  $(".replay").on("click",function(){
    $(".cue-replay").addClass("cue-show")
        .delay(1000)
        .queue(function(){
          $(this).removeClass("cue-show").dequeue();
        });
    ctx.clearRect(0,0,width,width);
    drawChessboard();
    blocks={};
    $(chessboard).off('click').on("click",handleClick);
    ai=false;
    flag=true;
  });
  $(".ren-ji").on("click",function(){
    $(".cue-ren-ji").addClass("cue-show")
        .delay(1000)
        .queue(function(){
          $(this).removeClass("cue-show").dequeue();
        });
    ctx.clearRect(0,0,width,width);
    drawChessboard();
    $(this).toggleClass("active");
    blocks={};
    $(chessboard).off('click').on("click",handleClick);
    ai=true;
  });
});