import Database from '../DM/Database';
import DAPATH from '../DM/DAPATH';
import { detailList } from '../DM/DAPATH';

const DATA_title = '졸업요건 달성현황';
const NO_INFO = `정보없음`;
const NO_TRACK = "no track";

//문자정보 처리방식
let stustat = {}
stustat[DAPATH.GRAINFO_ENGLISH] = ["fail","pass"];
//이수 현황 텍스트
let tit_text = {};
tit_text[DAPATH.LIST_REQUIRED] = "필수 과목 이수 현황";
tit_text[DAPATH.LIST_DESIGN] = "설계 과목 이수 현황";

//-----//
let student = Database.getStudent();
let total = 0;
let score = 0;

export default class RemainManageViewModel {
    getGraduationInfoUIstring(trackname) {
        return getUIstring(-1, trackname, Database.getGraduationInfoLists()[trackname], DAPATH.GRAINFO_GRADUATION);
    }
    getDesignUIstring(trackname) {
        return getUIstring(1, trackname, Database.getDesignSubjectList(), DAPATH.GRAINFO_DESIGN);
    }

    getStartupUIstring(trackname) {
        return getUIstring(1, trackname, Database.getStartupSubjectList(), DAPATH.GRAINFO_STARTUP);
    }

    getRequiredUIstring(trackname) {
        return getUIstring(1, trackname, Database.getRequiredSubjectLists()[trackname], DAPATH.GRAINFO_REQUIRED);
    }

    getRecommendedUIstring(trackname) {
        return getUIstring(1, trackname, Database.getRecommendedSubjectLists()[trackname], DAPATH.GRAINFO_COMBINED);
    }

    getSWgeneralUIstring(trackname) {
        return getUIstring(1, trackname, Database.getRequiredSubjectLists()[DAPATH.SOFTWARE_COMBINED_GENERAL], DAPATH.SOFTWARE_COMBINED_GENERAL);
    }

    getSWcommonUIstring(trackname) {
        return getUIstring(1, trackname, Database.getRequiredSubjectLists()[DAPATH.SOFTWARE_COMBINED_COMMON_MAJOR], DAPATH.SOFTWARE_COMBINED_COMMON_MAJOR);
    }

    getManageRemainUIstring(trackname) {
        let DATA = [];
        let temp = [];let arr1 = []; //let arr2 = [];
        let carrylist =  student.getCareerList();
        
        // for (let [key, value] of Object.entries(carrylist)) {
        //     let V = parseInt(value);
        //     console.log(V);
        //     if (!isNaN(V))
        //         carrylist[key] = V;
        // }
        //['기본소향', '전공기반', '공학전공'].map((key) => {carrylist['공학인증'] += (carrylist[key] === undefined) ? +'0' : +carrylist[key]});
         if (carrylist["기본소양"] != undefined && carrylist["전공기반"] != undefined && carrylist["공학전공"] != undefined)
             carrylist["공학인증"] = +carrylist["기본소양"] + +carrylist["전공기반"] + +carrylist["공학전공"];
        
        console.log("공학인증");
        console.log(carrylist);

        function progressMapping(item){
            const subj = item.name;
            let stuV = carrylist[subj];

            if (stuV == undefined){//학생이 관련정보가 없을때
                if (Number.isInteger(item.value)){//숫자정보 일때
                    item.value = `-/${item.value}${DAPATH.SUBJECT_CREDIT}`;
                    item.progress = 0;
                }
                else if (subj in stustat){//문자정보일때 처리방식이 정의되어 있음
                    item.value = NO_INFO;
                    item.progress = 0;
                }
                else 
                    return;
            }
            else{
                if (Number.isInteger(item.value)){//숫자정보 일때
                    total += item.value;
                    item.progress = Math.floor((stuV*100)/item.value)/100;
                    if (item.progress > 1) {
                        score += item.value;
                        item.progress = 1;
                    }
                    else{
                        score += +stuV;
                    }
                    item.value = `${stuV}/${item.value}${DAPATH.SUBJECT_CREDIT}`;
                }
                else if (subj in stustat){//문자정보일때 처리방식이 정의되어 있음
                    item.value = `${stuV}`;
                    total += 3;
                    if (stuV == stustat[subj][1]){
                        item.progress = 1;
                        score += 3;
                    }
                    else
                        item.progress = 0;
                }
                else 
                    return;
            }
            temp.push(item);
        }
        this.getGraduationInfoUIstring(trackname).map(function(item){
                if (detailList.indexOf(item.name) == -1)
                    arr1.push(item);
                //else 
                   // arr2.push(item);
        });
        arr1.map(progressMapping);
        getList(trackname).map(function(item){
            temp.push(item);
        });
        console.log("score : "+ score);
        console.log("total : "+ total);
        temp.unshift({name: "총 합",progress: Math.floor((score*100)/total)/100 });
        
        DATA.push({title : DATA_title, data : temp});

        //console.log(DATA[0].data[9].list.data[0]);
        return DATA;
    }
}

function getUIstring(num, trackname, info, path) {
    switch (num) {
        case 1:     
            let temp = info.map(function (item) {
                if (num === -1) { // graduationinfo
                    let key = Object.keys(item)[0];
                    if (key !== undefined) return { name: key, value: item[key] };
                } else {
                    if (item[DAPATH.SUBJECT_NAME] !== undefined) return { name: item[DAPATH.SUBJECT_NAME] };
                }
            });
        return temp;
        case -1: // graduationinfo
            let tem = []
            for (var key in info){
                tem.push({name:key,value:info[key]})
            }
        return tem;
    }
}


function getList(tname){
    let data = [];
    let reqlist = Database.getRequiredSubjectLists();
    let deslist = Database.getDesignSubjectList();
    let reclist = Database.getRecommendedSubjectLists();

    switch (tname){
        case DAPATH.COMPUTPER_ABEEK: 
            data.push(getListData(tname,DAPATH.LIST_REQUIRED,reqlist[tname])); 
            data.push(getListData(tname,DAPATH.LIST_DESIGN,deslist)); return data;
        case DAPATH.GLOBAL_SOFTWARE_DOUBLE_MAJOR:
        case DAPATH.GLOBAL_SOFTWARE_OVERSEAS_UNIV:
        case DAPATH.GLOBAL_SOFTWARE_MASTERS_CHAINING:
            data.push(getListData(tname,DAPATH.LIST_REQUIRED,reqlist[tname])); 
            data.push(getListData(tname,DAPATH.GRAINFO_STARTUP,deslist)); return data;
        case DAPATH.FINTECH:
        case DAPATH.BIGDATA:
        case DAPATH.MEDIAART:
        case DAPATH.CONSTRUCTION_IT:
            data.push(getListData(tname,DAPATH.GRAINFO_COMBINED,reclist[tname]));  
            data.push(getListData(tname,DAPATH.GRAINFO_COMMON_MAJOR,reqlist[DAPATH.SOFTWARE_COMBINED_COMMON_MAJOR]));
            data.push(getListData(tname,DAPATH.GRAINFO_GENERAL,reqlist[DAPATH.SOFTWARE_COMBINED_GENERAL]));return data;
    }
}
function getListData(tname,tit, subjectList) {
    let dat = [];
    let stuPerformed = student.getCompletedSubjectList();
    let val = 0
    let prog = 0
    var i = 0
    let gralist = Database.getGraduationInfoLists();
    let T = 1*gralist[tname][tit];

    for (i=0; i<Object.keys(subjectList).length; i++){
       dat.push({name : subjectList[i][DAPATH.SUBJECT_NAME] , value : 'X'});
        for (var j=0; j<Object.keys(stuPerformed).length; j++){
            if (subjectList[i][DAPATH.SUBJECT_NAME] === stuPerformed[j][DAPATH.SUBJECT_NAME] ) {
                dat[i]["value"] = "O"
                if (tit === DAPATH.LIST_REQUIRED )  val += 1;
                else val += 1*stuPerformed[j][DAPATH.SUBJECT_CREDIT];
            }
        }
    }
    if (tit === DAPATH.LIST_REQUIRED) { 
        //prog = 100*(val/i).toFixed(2) + "%"; 
        prog = Math.floor((val*100)/i)/100;
        if (prog > 1) prog = 1;
        val = val +"/"+i+"과목";
    }
    else { 
        //prog = 100*(val/total).toFixed(2) + "%"; 
        prog = Math.floor((val*100)/T)/100;
        if (prog > 1) prog = 1;
        val = val + "/" + T+DAPATH.SUBJECT_CREDIT;
    } 
    return {name : tit,value : val,progress: prog,list : {title : tit_text[tit], data: dat}};
}