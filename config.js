/* GESSA - Supabase public browser configuration.
   Paste ONLY your Project URL and Publishable/anon public key below.
   NEVER put service_role or secret keys in this file. */
var SUPABASE_URL = 'https://jfrkrumgjqycijoucbdq.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_4VdgSQbvCq9zocXUIuwKsw_iJc5EnEN'; /* ابدأ بـ eyJ أو sb_publishable_ : Project Settings > API */
/* true = لازم المستخدم يأكد رقمه بكود SMS. فعّلها بعد ما تجهز خدمة الرسائل في Supabase. */
var REQUIRE_PHONE_VERIFICATION = false;

window.GESSA = (function () {
  var instance = null;
  function ok() {
    return typeof SUPABASE_URL === 'string' && SUPABASE_URL.indexOf('PASTE_') === -1 &&
      typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.indexOf('PASTE_') === -1;
  }
  function client() {
    if (!ok()) throw new Error('أدخل Project URL وPublishable key في config.js');
    if (!window.supabase) throw new Error('لم يتم تحميل مكتبة Supabase. تحقق من اتصال الإنترنت.');
    if (!instance) instance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return instance;
  }
  function h(tag, cls, value) {
    var el=document.createElement(tag);
    if(cls) el.className=cls;
    if(value!==undefined && value!==null) el.textContent=value;
    return el;
  }
  var timer;
  function say(message) {
    var toast=document.getElementById('toast');
    if(!toast){toast=h('div','toast');toast.id='toast';toast.setAttribute('role','status');document.body.appendChild(toast);}
    toast.textContent=message;toast.hidden=false;clearTimeout(timer);
    timer=setTimeout(function(){toast.hidden=true;},6000);
  }
  function shell(active,user,c) {
    if(document.querySelector('header.site-header')) return;
    var header=h('header','site-header'), logo=h('a','logo','GESSA');
    logo.href='home.html';
    var nav=h('nav');
    [['home','الرئيسية','home.html'],['shop','التسوق','shop.html'],['merchant','التجار','merchant.html'],['world','العالم الافتراضي','world.html']].forEach(function(item){
      var a=h('a',item[0]===active?'on':'',item[1]);a.href=item[2];nav.appendChild(a);
    });
    var right=h('div','header-actions');
    var admin=h('a','link','الإدارة');admin.href='admin.html';admin.hidden=(user.app_metadata||{}).role!=='owner';
    var out=h('button','link','تسجيل الخروج');out.type='button';
    out.onclick=async function(){await c.auth.signOut();location.href='index.html';};
    right.append(admin,out);header.append(logo,nav,right);document.body.prepend(header);
  }
  async function boot(active,callback,options) {
    options=options||{};
    var main=document.querySelector('main');
    try {
      if(!ok()){if(main)main.textContent='أدخل بيانات Supabase العامة في config.js أولًا.';return;}
      var c=client(),result=await c.auth.getSession(),session=result.data&&result.data.session;
      if(!session){location.replace('index.html');return;}
      if(!options.skipOnboarding && active!=='onboarding'){
        var p=await c.from('profile_private').select('phone,phone_verified,date_of_birth').eq('user_id',session.user.id).maybeSingle();
        var done=p.data&&p.data.phone&&p.data.date_of_birth&&(!REQUIRE_PHONE_VERIFICATION||p.data.phone_verified);
        if(!p.error&&!done){location.replace('onboarding.html');return;}
      }
      shell(active,session.user,c);
      await callback(c,session.user);
    } catch(e) { say(e.message||'حدث خطأ أثناء تشغيل الصفحة.'); }
  }
  function money(cents,currency){return (Number(cents||0)/100).toLocaleString('ar-EG',{maximumFractionDigits:2})+' '+(currency||'EGP');}
  return {ok:ok,client:client,h:h,say:say,boot:boot,money:money};
})();
