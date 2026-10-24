#!/usr/bin/env python3
"""Local-only packaging preparation. Reads verifier config; never takes a password."""
from pathlib import Path
import json, hashlib, colorsys, re, unicodedata
from court_locations import resolve_location, GROUPS
ROOT=Path(__file__).resolve().parent

def jsdata(name,global_name,data):
    (ROOT/name).write_text("'use strict';\nwindow."+global_name+' = '+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')

def build():
    raw=(ROOT/'data.js').read_text();data=json.loads(raw[raw.index('{'):raw.rindex('}')+1])
    search_path=ROOT/'case-search-data.json'
    search_raw=search_path.read_text() if search_path.exists() else (ROOT/'case-search-data.js').read_text()
    search=json.loads(search_raw if search_path.exists() else search_raw[search_raw.index('{'):search_raw.rindex('}')+1])
    asset_manifest=ROOT/'search-assets.json'
    if asset_manifest.exists() and not search_path.exists():
        for chunk in json.loads(asset_manifest.read_text())['chunks']:
            raw=(ROOT/chunk['file']).read_text()
            search['corpusUnits'].extend(json.loads(raw.split('const units = ',1)[1].split('; for (const unit',1)[0]))
            marker='window.CASE_SEARCH_DATA.sourceRevisionCoverage = '
            if marker in raw: search['sourceRevisionCoverage']=json.loads(raw.split(marker,1)[1].rsplit(';',1)[0])
    jsdata('case-search-data.js','CASE_SEARCH_DATA',search)
    if asset_manifest.exists():
        import copy
        manifest=json.loads(asset_manifest.read_text()); whole=copy.deepcopy(search); units=whole['corpusUnits']; whole['corpusUnits']=[]
        revision_coverage=whole['sourceRevisionCoverage']
        if manifest.get('metadataAssignments'):whole['sourceRevisionCoverage']={}
        jsdata('case-search-data.js','CASE_SEARCH_DATA',whole)
        for chunk in manifest['chunks']:
            text=json.dumps(units[chunk['startUnitIndex']:chunk['endUnitIndexExclusive']],ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
            (ROOT/chunk['file']).write_text("'use strict';\n{ const units = "+text+"; for (const unit of units) window.CASE_SEARCH_DATA.corpusUnits.push(unit); }\n")
            if manifest.get('metadataAssignments',{}).get('sourceRevisionCoverage')==chunk['file']:
                with (ROOT/chunk['file']).open('a') as f:f.write('window.CASE_SEARCH_DATA.sourceRevisionCoverage = '+json.dumps(revision_coverage,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')

    config_path=ROOT/'auth-config.json'
    config_raw=config_path.read_text() if config_path.exists() else (ROOT/'auth-config.js').read_text()
    config=json.loads(config_raw if config_path.exists() else config_raw[config_raw.index('{'):config_raw.rindex('}')+1])
    assert config['sessionHours']==6 and config['algorithm']=='PBKDF2-SHA256' and config['verifierBase64']
    jsdata('auth-config.js','AUTH_CONFIG',config)
    courts=set(str(r.get('court') or 'Court not stated').strip() for key in ('currentRows','historyRows','unidentifiedLeads') for r in data[key])
    for row in search.get('supplementaryCalendarRows',[]):
        courts.add(str(row.get('court') or 'Court not stated').strip())
    for p in search['profiles']:
        courts.add(str(p.get('court') or 'Court not stated').strip())
        courts.update(str(c).strip() for c in p.get('courts',[]) if c)
    alias_config=json.loads((ROOT/'court-aliases.json').read_text())
    aliases={label:group for group in alias_config['groups'] for label in group['aliases']}
    def literal_key(label):return re.sub(r'[^\w]','',unicodedata.normalize('NFKC',label).lower())
    registry={};css=['/* Colors use punctuation-normalized labels and explicitly evidenced aliases; original labels remain unchanged. */'];written=set()
    for label in sorted(courts):
        alias=aliases.get(label);identity=alias['id'] if alias else literal_key(label)
        digest=hashlib.sha256(identity.encode()).hexdigest();h=int(digest[:8],16)/0xffffffff
        def color(l,s):return '#'+''.join(f'{round(v*255):02x}' for v in colorsys.hls_to_rgb(h,l,s))
        ink=color(.265,.56);soft=color(.95,.39);cls='court-'+digest[:10]
        registry[label]={'label':label,'className':cls,'color':ink,'background':soft,'code':digest[:4].upper(),'canonicalKey':identity,'canonicalLabel':alias['canonicalLabel'] if alias else label,'aliasEvidence':alias['evidence'] if alias else None}
        registry[label].update(resolve_location(label,alias))
        if cls not in written:css.append(f'.{cls}'+'{--court-ink:'+ink+';--court-soft:'+soft+'}');written.add(cls)
    for key,(name,ink,soft) in GROUPS.items():
        css.append('.location-'+key+'{--court-ink:'+ink+';--court-soft:'+soft+'}')
    jsdata('courts.js','COURT_STYLES',registry)
    (ROOT/'court-colors.css').write_text('\n'.join(css)+'\n')
    print(json.dumps({'profiles':len(search['profiles']),'corpusUnits':len(search.get('corpusUnits',[])),'courtLabels':len(courts),'partyBindings':len(search.get('rowPartyBindings',{}))}))
if __name__=='__main__':build()
