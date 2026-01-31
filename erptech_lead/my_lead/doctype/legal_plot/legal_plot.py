# Copyright (c) 2026, erptech and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LegalPlot(Document):
	def before_insert(self):
		"""Auto-fill entered_by and entered_on on document creation"""
		self.entered_by = frappe.session.user
		self.entered_on = frappe.utils.now()
		self.last_updated_on = frappe.utils.now()

	def before_save(self):
		"""Auto-fill last_updated_on on document save"""
		self.last_updated_on = frappe.utils.now()
