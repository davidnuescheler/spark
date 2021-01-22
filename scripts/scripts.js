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
    let cols=Array.from($cols).map((e) => toClassName(e.textContent)).filter(e => e?true:false);
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

function loadScript(url,callback) {
  const $head=document.querySelector('head');
  const $script=createTag('script', {src: url});
  $head.append($script);
  $script.onload=callback;
}


function decorateHero() {
  const $h1=document.querySelector('main h1');
  const $heroPicture=$h1.parentElement.querySelector('picture');
  let $heroSection;

  if ($h1) {
    const $main=document.querySelector('main');
    if ($main.children.length==1) {
      $heroSection=createTag('div', {class: 'section-wrapper hero'});
      const $div=createTag('div');
      $heroSection.append($div);
      if ($heroPicture) {
        $div.append($heroPicture);
      }
      $div.append($h1);
      $main.prepend($heroSection);
    } else {
      $heroSection=$h1.closest('.section-wrapper');
      $heroSection.classList.add('hero');
    }
  }
  if ($heroPicture) {
    $heroPicture.classList.add('hero-bg');
    const $heroImage=$heroPicture.querySelector('img');
    console.log($heroImage);
    $heroImage.addEventListener('load', () => {
      postLCP();
    })
  } else {
    $heroSection.classList.add('hero-noimage');
    postLCP();
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
      if (!$a.querySelector('img')) {
        if ($up.childNodes.length==1 && $up.tagName=='P') {
          $a.className='button secondary';
          }
          if ($up.childNodes.length==1 && $up.tagName=='STRONG' && 
          $twoup.childNodes.length==1 && $twoup.tagName=='P') {
          $a.className='button primary';
          }    
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

function decorateTemplate() {
  if (window.location.pathname.includes('/make/')) {
    document.body.classList.add('make-page');
  }
  const year=window.location.pathname.match(/\/20\d\d\//);
  if (year) {
    document.body.classList.add('blog-page');
  }
}

function decorateBlogPage() {
  if (document.body.classList.contains('blog-page')) {
    const $sections=document.querySelectorAll('main>div.section-wrapper>div');
    const $body=$sections[1];
    let $by;
    let $postedOn;
    $body.querySelectorAll('p').forEach($p => {
      if (!$by && $p.textContent.toLowerCase().startsWith('by ')) $by=$p;
      if (!$postedOn && $p.textContent.toLowerCase().startsWith('posted on ')) $postedOn=$p;
    })
    const by=$by.textContent.substring(3);
    const posted=$postedOn.textContent.substring(10).split('-');
    var months= ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];
    $by.innerHTML=`<span class="byline"><img src="/icons/user.svg"> ${by} | ${months[+posted[0]-1]} ${posted[1]}, ${posted[2]} </span>`;
    $postedOn.remove();
  }
}

function decorateHowTo() {
  const $head=document.head;
  document.querySelectorAll('main .how-to-steps').forEach(($howto) => {
    const $heading=$howto.previousElementSibling;
    const $rows=Array.from($howto.children);
    const $schema=createTag('script', {type: 'application/ld+json'});
    let schema={
      "@context":"http://schema.org",
      "@type":"HowTo",
      "name": $heading.textContent ,"step":[]
    };

    $rows.forEach(($row, i)=> {
      const $cells=Array.from($row.children);
      const $number=createTag('div', {class: 'number'});
      $number.innerHTML='<span>'+(i+1)+'</span>';
      $row.prepend($number);
      schema.step.push( {
        "@type":"HowToStep",
        "position":i+1,
        "name": $cells[0].textContent,
        "itemListElement":{
          "@type":"HowToDirection",
          "text":$cells[1].textContent
        }
      })
      const $h3=createTag('h3');
      $h3.innerHTML=$cells[0].textContent;
      $cells[1].prepend($h3);
      $cells[1].classList.add('tip');
      $cells[0].remove();
    })
    $schema.innerHTML=JSON.stringify(schema);
    $head.append($schema);
  })
}

function decorateABTests() {
  let runTest=true;
  let reason='';

  if (!window.location.host.includes('adobe.com')) { runTest=false; reason='not prod host';}
  if (window.location.hash) {runTest=false; reason='suppressed by #'; }
  if (window.location.search == '?test') runTest=true;
  if (navigator.userAgent.match(/bot|crawl|spider/i)) {runTest=false; reason='bot detected'; }


  if (runTest) {
      let $testTable;
      document.querySelectorAll('table th').forEach($th => {
          if ($th.textContent.toLowerCase().trim() == 'a/b test') {
              $testTable=$th.closest('table');
          }
      })
      
      const testSetup=[];
  
      if ($testTable) {
          $testTable.querySelectorAll('tr').forEach($row => {
              const $name=$row.children[0];
              const $percentage=$row.children[1];
              const $a=$name.querySelector('a');
              if ($a) {
                  const url=new URL($a.href);
                  testSetup.push({url: url.pathname, traffic: parseFloat($percentage.textContent)/100.0})
              }
          })
      }

      
      let test=Math.random();
      let selectedUrl='';
      testSetup.forEach((e) => {
          if (test>=0 && test<e.traffic) {
              selectedUrl=e.url;
          }
          test-=e.traffic;
      })
  
      if (selectedUrl) window.location.href=selectedUrl;    
  } else {
      console.log(`Test is not run => ${reason}`);
  }
}
async function fetchBlogIndex() {
  const resp=await fetch('/blog-index.json');
  const json=await resp.json();
  return (json.data);
}

async function filterBlogPosts(locale, filters) {
  if (!window.blogIndex) {
      window.blogIndex=await fetchBlogIndex();
  }
  const index=window.blogIndex;

  const f={};
  for (let name in filters) {
      const vals=filters[name];
      let v=vals;
      if (!Array.isArray(vals)) {
          v=[vals];
      }
      console.log(v);
      f[name]=v.map(e => e.toLowerCase().trim());
  }

  console.log(f);

  const result=index.filter((post) => {
    let matchedAll=true;
      for (let name in f) {
          let matched=false;
          f[name].forEach((val) => {
              if (post[name].toLowerCase().includes(val)) {
                  matched=true;
              }
          });
          if (!matched) {
            matchedAll=false;
            break;
          }
      }
      return (matchedAll);
  });

  return (result);
}

function readBlockConfig($block) {
  const config={};
  $block.querySelectorAll(':scope>div').forEach(($row) => {
    if ($row.children && $row.children[1]) {
      const name=toClassName($row.children[0].textContent);
      const $a=$row.children[1].querySelector('a');
      let value='';
      if ($a) value=$a.href;
      else value=$row.children[1].textContent;
      config[name]=value;  
    }
  });
  return config;
}

function decorateBlogPosts() {
  document.querySelectorAll('main .blog-posts').forEach( async ($blogPosts, i) => {
    const config=readBlockConfig($blogPosts);
    const posts=await filterBlogPosts('en-US', config);
    $blogPosts.innerHTML='';
    posts.forEach((post) => {
      const $card=createTag('div', {class: 'card' });
      $card.innerHTML=`<div class="card-image">
        <img loading="lazy" src="${post.image}">
      </div>
      <div class="card-body">
        <h3>${post.title}</h3>
        <p>${post.teaser}</p>
      </div>`;
      $card.addEventListener('click', (evt) => {
        window.location.href='/'+post.path;
      })
      $blogPosts.appendChild($card);
    })
  })
}

function decoratePage() {
    decoratePictures();
    decorateABTests();
    decorateTables();
    wrapSections('main>div');
    decorateHeader();
    decorateHero();
    decorateBlocks();
    decorateTemplate();
    decorateButtons();
    decorateHowTo();
    decorateExamplePages();
    decorateBlogPage();
}

function postLCP() {
  loadCSS('/styles/lazy-styles.css');
  loadLazyFooter();
  if (window.location.search=='?martech') loadScript('/scripts/martech.js');
  decorateBlogPosts();
}

decoratePage();
