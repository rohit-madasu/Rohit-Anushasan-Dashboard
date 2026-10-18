"""Display-only court-location grouping. Never changes court identity or evidence."""
import re
GROUPS = {
 'kukatpally': ('Kukatpally', '#174a85', '#edf4fc'),
 'kalpataru': ('Kalpataru', '#65308a', '#f6effb'),
 'lb-nagar': ('L.B. Nagar', '#176444', '#edf8f1'),
 'nampally': ('Nampally', '#91400d', '#fff3e8'),
 'secunderabad': ('Secunderabad', '#8a285b', '#fceef5'),
 'medipally': ('Medipally', '#176171', '#edf8fb'),
 'malkajgiri': ('Malkajgiri', '#654c12', '#fcf7e8'),
 'narayanpet': ('Narayanpet', '#414c92', '#f0f2fc'),
 'ibrahimpatnam': ('Ibrahimpatnam', '#77502e', '#fbf3ed'),
 'atmakur': ('Atmakur', '#415d2b', '#f2f8ed'),
 'devarakonda': ('Devarakonda', '#76507b', '#f9f1fa'),
 'mancherial': ('Mancherial', '#345c75', '#eff6fa'),
 'suryapet': ('Suryapet', '#6e4141', '#faf0f0'),
 'unknown': ('Location unconfirmed', '#475569', '#f1f5f9')
}

def resolve_location(label, alias=None):
 text=str(label).lower()
 # An explicitly evidenced equivalent court label may supply a missing locality.
 if alias: text += ' ' + alias['canonicalLabel'].lower()
 compact=re.sub(r'[^a-z0-9]', '', text)
 hits=set()
 for key in GROUPS:
  if key in ('unknown','lb-nagar','malkajgiri'): continue
  token='kalpa(?:tha|ta)ru' if key=='kalpataru' else re.escape(key)
  if re.search(token,text): hits.add(key)
 if 'lbnagar' in compact: hits.add('lb-nagar')
 # District name alone is insufficient: require an explicit venue expression.
 if re.search(r'(?:at|courts?[, ·/]+)\s*malkajgiri\b',text): hits.add('malkajgiri')
 # Kalpataru complex is within LB Nagar but explicitly requested as its own group.
 if 'kalpataru' in hits: hits.discard('lb-nagar')
 key=next(iter(hits)) if len(hits)==1 else 'unknown'
 name,ink,soft=GROUPS[key]
 return {'locationKey':key,'locationLabel':name,'locationClassName':'location-'+key,
         'locationColor':ink,'locationBackground':soft,
         'locationBasis': ('Conflicting explicit locations; requires review' if len(hits)>1 else
                           'Explicit location in recorded court label or evidenced court alias' if hits else
                           'No unambiguous court venue in source label'),
         'locationCandidates':sorted(hits)}
