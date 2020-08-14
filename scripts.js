/**
 * Creates a tag with the given name and attributes.
 * @param {string} name The tag name
 * @param {object} attrs An object containing the attributes
 * @returns The new tag
 */
function createTag(name, attrs) {
    const el = document.createElement(name);
    if (typeof attrs === 'object') {
      for (let [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
    }
    return el;
  }


/**
 * Fixes helix icon functionality until 
 * https://github.com/adobe/helix-pipeline/issues/509
 * is resolved.
 */

function fixIcons() {
  document.querySelectorAll("use").forEach ((e) => {
      var a=e.getAttribute("href");
      if (a.startsWith('/icons/')) {
        var name=a.split("/")[2].split(".")[0];
        if (name.startsWith('i-')) {
          e.setAttribute("href", `/icons.svg#${name.substr(2)}`);  
          e.parentNode.setAttribute("class", `icon icon-${name.substr(2)}`);  
        } else {
          const $img=createTag('img', { class: `icon icon-${name}`, src: a});
          e.parentNode.parentNode.replaceChild($img, e.parentNode);
        }
      }
  });
}

function toClassName(name) {
  return (name.toLowerCase().replace(/[^0-9a-z]/gi, '-'))
}

function decorateTables() {
    document.querySelectorAll('main div.default>table').forEach(($table) => {
        const $cols=$table.querySelectorAll('thead tr th');
        const cols=Array.from($cols).map((e) => toClassName(e.innerHTML));
        const $rows=$table.querySelectorAll('tbody tr');
        let $div={};

        if (cols.length==1 && $rows.length==1) {
            $div=createTag('div', {class:`${cols[0]}`});
            $div.innerHTML=$rows[0].querySelector('td').innerHTML;
        } else {
            $div=turnTableSectionIntoCards($table, cols) 
        }
        $table.parentNode.replaceChild($div, $table);
    });
  }

function turnTableSectionIntoCards($table, cols) {
    const $rows=$table.querySelectorAll('tbody tr');
    const $cards=createTag('div', {class:`cards ${cols.join('-')}`})
    $rows.forEach(($tr) => {
        const $card=createTag('div', {class:'card'})
        $tr.querySelectorAll('td').forEach(($td, i) => {
            const $div=createTag('div', {class: cols[i]});
            const $a=$td.querySelector('a[href]');
            if ($a && $a.getAttribute('href').startsWith('https://www.youtube.com/')) {
                const yturl=new URL($a.getAttribute('href'));
                const vid=yturl.searchParams.get('v');
                $div.innerHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div>`;
            } else {
                $div.innerHTML=$td.innerHTML;
            }
            $card.append($div);
        });
        $cards.append($card);
    });
    return ($cards);
  }

function wrapSections(element) {
    document.querySelectorAll(element).forEach(($div) => {
        const $wrapper=createTag('div', { class: 'section-wrapper'});
        $div.parentNode.appendChild($wrapper);
        $wrapper.appendChild($div);
    });
}

function createHeroSection() {
  const $headerImg=document.querySelector('main>div:first-of-type>div>:first-child>img');
  if ($headerImg) {
    const src=$headerImg.getAttribute('src');
    $wrapper=$headerImg.closest('.section-wrapper');
    $wrapper.style.backgroundImage=`url(${src})`;
    $headerImg.parentNode.remove();
  }
  const $h1=document.querySelector('main>div:first-of-type h1');
  if ($h1) {
    $h1.closest('.section-wrapper').classList.add('hero');
  }
}

function addClassToTextLinks() {
  document.querySelectorAll('a').forEach(($a) => {
    if (!$a.firstElementChild || $a.firstElementChild.tagName!='IMG') {
      $a.classList.add('text-link');
    }
  });
}

function decorateListItems() {
  document.querySelectorAll('li').forEach(($li) => {
    const splits=$li.innerHTML.split('<br>');
    $li.innerHTML=`<h3>${splits[0]}</h3><p>${splits[1]}</p>`;
  });
}

function decoratePage() {
    fixIcons();
    decorateTables();
    wrapSections('main>div');
    createHeroSection();
    addClassToTextLinks();
    decorateListItems();
}

if (document.readyState == 'loading') {
    window.addEventListener('DOMContentLoaded', (event) => {
        decoratePage();
    });
} else {
    decoratePage();
}
