var lst;
var articlesArr;

for (var i=0; i<lst.length; i++) {
    var title = lst[i].getElementsByTagName('h4');
    var text = lst[i].getElementsByClassName('art_headlines_sub_title');
    var img = lst[i].getElementsByTagName('img');
    var article = {
        title: title[0],
        text: text[0],
        img: img[0]
    };
    articlesArr.push(article);
}
