#!/usr/bin/env ruby

require 'json'

def get_items filename, *columns
    JSON.parse(File.read(filename))
         .flat_map { |x| x['fields'].map { |k, v| [k, v] } }
         .filter { |k, v| columns.include? k }
         .map { |_, v| v }
         .uniq
end

puts "import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export class TranslationFixtures {

  constructor()
  {
" + 
(
    get_items('../backend/workouts/fixtures/exercises.json', 'name', 'short_name') + 
    get_items('../backend/workouts/fixtures/skills.json', 'name', 'class_name') + 
    get_items('../backend/workouts/fixtures/muscles.json', 'name') + 
    get_items('../backend/workouts/fixtures/mets.json', 'description')
).uniq
.map { |x| '    marker("' + x +'");' }
.join("\n") + "
  }
}"
