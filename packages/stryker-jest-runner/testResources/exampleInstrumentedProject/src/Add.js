var cov_whjko47tm=function(){var path="C:\\z\\github\\stryker-mutator\\stryker\\packages\\stryker-jest-runner\\testResources\\exampleProject\\src\\Add.js",hash="eb95793c7d1ed74e449e4010989d81d4bb95c64b",Function=function(){}.constructor,global=new Function('return this')(),gcv="__coverage__",coverageData={path:"C:\\z\\github\\stryker-mutator\\stryker\\packages\\stryker-jest-runner\\testResources\\exampleProject\\src\\Add.js",statementMap:{"0":{start:{line:1,column:0},end:{line:3,column:2}},"1":{start:{line:2,column:2},end:{line:2,column:21}},"2":{start:{line:5,column:0},end:{line:8,column:2}},"3":{start:{line:6,column:2},end:{line:6,column:11}},"4":{start:{line:7,column:2},end:{line:7,column:16}},"5":{start:{line:10,column:0},end:{line:12,column:2}},"6":{start:{line:11,column:2},end:{line:11,column:17}},"7":{start:{line:14,column:0},end:{line:20,column:2}},"8":{start:{line:15,column:19},end:{line:15,column:24}},"9":{start:{line:16,column:2},end:{line:18,column:3}},"10":{start:{line:17,column:4},end:{line:17,column:22}},"11":{start:{line:19,column:2},end:{line:19,column:20}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:1,column:14},end:{line:1,column:15}},loc:{start:{line:1,column:35},end:{line:3,column:1}},line:1},"1":{name:"(anonymous_1)",decl:{start:{line:5,column:17},end:{line:5,column:18}},loc:{start:{line:5,column:34},end:{line:8,column:1}},line:5},"2":{name:"(anonymous_2)",decl:{start:{line:10,column:17},end:{line:10,column:18}},loc:{start:{line:10,column:34},end:{line:12,column:1}},line:10},"3":{name:"(anonymous_3)",decl:{start:{line:14,column:27},end:{line:14,column:28}},loc:{start:{line:14,column:44},end:{line:20,column:1}},line:14}},branchMap:{"0":{loc:{start:{line:16,column:2},end:{line:18,column:3}},type:"if",locations:[{start:{line:16,column:2},end:{line:18,column:3}},{start:{line:16,column:2},end:{line:18,column:3}}],line:16}},s:{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0},f:{"0":0,"1":0,"2":0,"3":0},b:{"0":[0,0]},_coverageSchema:"332fd63041d2c1bcb487cc26dd0d5f7d97098a6c"},coverage=global[gcv]||(global[gcv]={});if(coverage[path]&&coverage[path].hash===hash){return coverage[path];}coverageData.hash=hash;return coverage[path]=coverageData;}();cov_whjko47tm.s[0]++;exports.add=function(num1,num2){cov_whjko47tm.f[0]++;cov_whjko47tm.s[1]++;return num1+num2;};cov_whjko47tm.s[2]++;exports.addOne=function(number){cov_whjko47tm.f[1]++;cov_whjko47tm.s[3]++;number++;cov_whjko47tm.s[4]++;return number;};cov_whjko47tm.s[5]++;exports.negate=function(number){cov_whjko47tm.f[2]++;cov_whjko47tm.s[6]++;return-number;};cov_whjko47tm.s[7]++;exports.isNegativeNumber=function(number){cov_whjko47tm.f[3]++;var isNegative=(cov_whjko47tm.s[8]++,false);cov_whjko47tm.s[9]++;if(number<0){cov_whjko47tm.b[0][0]++;cov_whjko47tm.s[10]++;isNegative=true;}else{cov_whjko47tm.b[0][1]++;}cov_whjko47tm.s[11]++;return isNegative;};