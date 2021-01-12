function toClassName(name) {
  return (name.toLowerCase().replace(/[^0-9a-z]/gi, '-'))
}


function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    for (let [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}  

function wrapSections(element) {
  document.querySelectorAll(element).forEach(($div) => {
      if (!$div.id) {
          const $wrapper=createTag('div', { class: 'section-wrapper'});
          $div.parentNode.appendChild($wrapper);
          $wrapper.appendChild($div);    
      }
  });
}

function decorateTables() {
  document.querySelectorAll('main div>table').forEach(($table) => {
    const $cols=$table.querySelectorAll('thead tr th');
    let cols=Array.from($cols).map((e) => toClassName(e.innerHTML)).filter(e => e?true:false);
    const $rows=$table.querySelectorAll('tbody tr');
    let $div={};
    /* workaround for import */
    if (cols.length==0) cols=['template-list'];
    $div=tableToDivs($table, cols) 
    $table.parentNode.replaceChild($div, $table);
  });
}
  
function tableToDivs($table, cols) {
  const $rows=$table.querySelectorAll('tbody tr');
  const $cards=createTag('div', {class:`${cols.join('-')} block`})
  $rows.forEach(($tr) => {
    const $card=createTag('div')
    $tr.querySelectorAll('td').forEach(($td, i) => {
      const $div=createTag('div', cols.length>1?{class: cols[i]}:{});
        $div.innerHTML=$td.innerHTML;
        $div.childNodes.forEach(($child) => {
          if ($child.nodeName=='#text') {
            const $p=createTag('p');
            $p.innerHTML=$child.nodeValue;
            $child.parentElement.replaceChild($p, $child);
          }
        })
        $card.append($div);
      });
      $cards.append($card);
    });
  return ($cards);
}  

function addDivClasses($element, selector, classes) {
  const $children=$element.querySelectorAll(selector);
  $children.forEach(($div, i) => {
      $div.classList.add(classes[i]);
  })
}

function decorateHeader() {
  const $header=document.querySelector('header');
  const classes=['logo', 'susi'];
  addDivClasses($header, ':scope>p', classes);
  $header.querySelector('.susi a').classList.add('button');
}

function decoratePictures() {
  if (!document.querySelector('picture')) {
      const helixImages=document.querySelectorAll('main img[src^="/hlx_"');
      helixImages.forEach($img => {
          const $pic=createTag('picture');
          const $parent=$img.parentNode;
          $pic.appendChild($img);
          $parent.appendChild($pic);
      })
  }
}

function decorateBlocks() {
  document.querySelectorAll('div.block').forEach(($block) => {
      const $section=$block.closest('.section-wrapper');
      if ($section) {
          const classes=Array.from($block.classList.values());
          $section.classList.add(classes[0]+'-container');
      }
  });
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
function loadCSS(href) {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', href);
  link.onload = () => {
  }
  link.onerror = () => {
  }
  document.head.appendChild(link);
};

function decorateHero() {
  const $h1=document.querySelector('main h1');
  const $heroImage=$h1.parentElement.querySelector('picture');
  let $heroSection;

  if ($h1) {
    const $main=document.querySelector('main');
    if ($main.children.length==1) {
      $heroSection=createTag('div', {class: 'section-wrapper hero'});
      const $div=createTag('div');
      $heroSection.append($div);
      if ($heroImage) {
        $div.append($heroImage);
      }
      $div.append($h1);
      $main.prepend($heroSection);
    } else {
      $heroSection=$h1.closest('.section-wrapper');
      $heroSection.classList.add('hero');
    }
  }
  if ($heroImage) {
    $heroImage.classList.add('hero-bg');
  } else {
    $heroSection.classList.add('hero-noimage');
  }

}

async function decorateExamplePages() {
  const usp=new URLSearchParams(window.location.search);
  const path=usp.get('urls');
  const $examplePages=document.getElementById('example-pages');
  if (path && $examplePages) {
    const $div=$examplePages.parentElement;
    const resp=await fetch(path);
    const json=await resp.json();
    const list=json.data;
    list.sort((e1,e2) => {
      return(e1.pathname.localeCompare(e2.pathname));
    });
    
    const $ol=createTag('ol');

    list.forEach((le) =>  {
      const $li=createTag('li');
      const pathname=le.pathname.split('.')[0];
      $li.innerHTML=`<a target="_blank" class="button" href="${pathname}">${pathname}</a>`;
      $ol.append($li)
    });
    $div.append($ol);
  }
}

function decorateButtons() {
  document.querySelectorAll('main a').forEach($a => {
      const $up=$a.parentElement;
      const $twoup=$a.parentElement.parentElement;
      if ($up.childNodes.length==1 && $up.tagName=='P') {
      $a.className='button secondary';
      }
      if ($up.childNodes.length==1 && $up.tagName=='STRONG' && 
      $twoup.childNodes.length==1 && $twoup.tagName=='P') {
      $a.className='button primary';
      }
  })
}

async function loadLazyFooter() {
  const resp=await fetch('/lazy-footer.plain.html');
  const inner=await resp.text();
  const $footer=document.querySelector('footer');
  $footer.innerHTML=inner;
  $footer.querySelectorAll('a').forEach(($a) => {
    const url=new URL($a.href);
    if (url.hostname == 'spark.adobe.com') {
      const slash=url.pathname.endsWith('/')?1:0;
      $a.href=url.pathname.substr(0,url.pathname.length-slash);
    }
  })
  wrapSections('footer>div');
  addDivClasses($footer, 'footer > div', ['dark','grey','grey']);
  const $div=createTag('div', {class: 'hidden'});
  const $dark=document.querySelector('footer .dark>div');
  
  Array.from($dark.children).forEach(($e, i) => {
    if (i) $div.append($e);
  })

  $dark.append($div);

  $dark.addEventListener('click', (evt) => {
    $div.classList.toggle('hidden');
  })

}

function decoratePage() {
    decoratePictures();
    decorateTables();
    wrapSections('main>div');
    decorateHeader();
    decorateHero();
    decorateBlocks();
    decorateButtons();
    decorateExamplePages();
    loadCSS('/lazy-styles.css');
    loadLazyFooter();
}

decoratePage();
