# Copyright (c) 2026, erptech and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document


class Legal(Document):
	def before_insert(self):
		"""Auto-fill created_by and created_date on document creation"""
		self.created_by = frappe.session.user
		self.created_date = frappe.utils.now()
		
		# Initialize activity log
		self.activity_log = json.dumps([{
			"user": frappe.session.user,
			"timestamp": frappe.utils.now(),
			"action": "Created"
		}], indent=2, default=str)
		
		# Set initial last_updated fields same as created
		self.last_updated_by = frappe.session.user
		self.last_updated_date = frappe.utils.now()
	
	def before_save(self):
		"""Auto-fill last_updated_by and last_updated_date on document save"""
		# Always update last_updated fields on save
		self.last_updated_by = frappe.session.user
		self.last_updated_date = frappe.utils.now()
		
		# Update activity log
		self.update_activity_log()
	
	def update_activity_log(self):
		"""Update activity log with current action"""
		try:
			# Parse existing activity log
			if self.activity_log:
				try:
					activity_log = json.loads(self.activity_log)
				except (json.JSONDecodeError, TypeError):
					activity_log = []
			else:
				activity_log = []
			
			# Determine action type
			action = "Created" if self.is_new() else "Updated"
			
			# Add new activity entry
			activity_entry = {
				"user": frappe.session.user,
				"timestamp": frappe.utils.now(),
				"action": action
			}
			
			# Add changed fields if updating
			if not self.is_new() and hasattr(self, '_doc_before_save'):
				changed_fields = self.get_changed_fields()
				if changed_fields:
					activity_entry["changes"] = changed_fields
			
			activity_log.append(activity_entry)
			
			# Keep only last 100 entries
			if len(activity_log) > 100:
				activity_log = activity_log[-100:]
			
			self.activity_log = json.dumps(activity_log, indent=2, default=str)
		except Exception as e:
			# If activity log update fails, don't break the save
			frappe.log_error(f"Error updating activity log: {str(e)}")
	
	def get_changed_fields(self):
		"""Get changed fields for activity log"""
		changed_fields = {}
		if hasattr(self, '_doc_before_save'):
			doc_before = self._doc_before_save
			# Get all fields except system fields
			excluded_fields = ['modified', 'modified_by', 'last_updated_date', 'last_updated_by', 
							   'activity_log', 'creation', 'owner', 'name', 'docstatus']
			
			for field in self.meta.get_valid_columns():
				if field not in excluded_fields:
					try:
						old_value = getattr(doc_before, field, None)
						new_value = getattr(self, field, None)
						if old_value != new_value:
							changed_fields[field] = {
								"old": str(old_value) if old_value is not None else None,
								"new": str(new_value) if new_value is not None else None
							}
					except:
						pass
		return changed_fields
