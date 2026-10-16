#!/usr/bin/env python3
"""Local-only packaging preparation. Reads verifier config; never takes a password."""
from pathlib import Path
import json, hashlib, colorsys
ROOT=Path(__file__).resolve().parent

def jsdata(name,global_name,data):
    (ROOT/name).write_text("'use strict';\nwindow."+global_name+' = '+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')

def build():
    raw=(ROOT/'data.js').read_text();data=json.loads(raw[raw.index('{'):raw.rindex('}')+1])
    search_path=ROOT/'case-search-data.json'
    search_raw=search_path.read_text() if search_path.exists() else (ROOT/'case-search-data.js').read_text()
    search=json.loads(search_raw if search_path.exists() else search_raw[search_raw.index('{'):search_raw.rindex('}')+1])
    jsdata('case-search-data.js','CASE_SEARCH_DATA',search)
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
    registry={};css=['/* Exact recorded labels only. No inferred court equivalence. */']
    for label in sorted(courts):
        digest=hashlib.sha256(label.encode()).hexdigest();h=int(digest[:8],16)/0xffffffff
        def color(l,s):return '#'+''.join(f'{round(v*255):02x}' for v in colorsys.hls_to_rgb(h,l,s))
        ink=color(.265,.56);soft=color(.95,.39);cls='court-'+digest[:10]
        registry[label]={'label':label,'className':cls,'color':ink,'background':soft,'code':digest[:4].upper()}
        css.append(f'.{cls}'+'{--court-ink:'+ink+';--court-soft:'+soft+'}')
    jsdata('courts.js','COURT_STYLES',registry)
    (ROOT/'court-colors.css').write_text('\n'.join(css)+'\n')
    print(json.dumps({'profiles':len(search['profiles']),'corpusUnits':len(search.get('corpusUnits',[])),'courtLabels':len(courts),'partyBindings':len(search.get('rowPartyBindings',{}))}))
if __name__=='__main__':build()
