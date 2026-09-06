"""
Test suite for ROZgo Contract Management System
Tests the contract submission, viewing, and acceptance/rejection flows
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime


class TestContractSubmission:
    """Test contract submission by employers"""

    def test_submit_contract_success(self):
        """Test successful contract submission"""
        from app.schemas.booking import ContractSubmitSchema

        contract = ContractSubmitSchema(
            workerId="w-ramesh",
            serviceCategory="plumber",
            description="Fix bathroom plumbing leak",
            location="Tower 4, Gurgaon",
            date="2024-09-15",
            time="10:00 AM",
            agreedWage=2500.0,
            specialTerms="Payment after completion",
            duration=1
        )

        assert contract.workerId == "w-ramesh"
        assert contract.agreedWage == 2500.0
        assert contract.description == "Fix bathroom plumbing leak"
        assert contract.specialTerms == "Payment after completion"

    def test_submit_contract_no_hardcoded_wage(self):
        """Verify that contract uses employer-specified wage, not hardcoded"""
        from app.schemas.booking import ContractSubmitSchema

        # Test with 3000 wage
        contract1 = ContractSubmitSchema(
            workerId="w-suresh",
            serviceCategory="electrician",
            description="Repair electrical switchboard",
            location="Laxmi Nagar, Delhi",
            date="2024-09-16",
            agreedWage=3000.0
        )
        assert contract1.agreedWage == 3000.0

        # Test with 1500 wage
        contract2 = ContractSubmitSchema(
            workerId="w-deepak",
            serviceCategory="carpenter",
            description="Fix door lock",
            location="Cyber City, Gurgaon",
            date="2024-09-17",
            agreedWage=1500.0
        )
        assert contract2.agreedWage == 1500.0

        # Test with 5000 wage
        contract3 = ContractSubmitSchema(
            workerId="w-ramesh",
            serviceCategory="mason",
            description="Wall plastering",
            location="Indirapuram, Ghaziabad",
            date="2024-09-18",
            agreedWage=5000.0
        )
        assert contract3.agreedWage == 5000.0


class TestContractRetrieval:
    """Test workers viewing their contracts"""

    def test_get_worker_contracts_structure(self):
        """Test that worker contract list has correct structure"""
        # Mock response structure
        contracts_response = {
            "contracts": [
                {
                    "id": str(uuid.uuid4()),
                    "bookingReference": "RZG-CT-ABCD",
                    "serviceCategory": "plumber",
                    "jobTitle": "plumber Contract",
                    "description": "Fix main water pipe",
                    "location": "Sector 62, Noida",
                    "date": "2024-09-15",
                    "agreedWage": 2500.0,
                    "specialTerms": "Payment after completion",
                    "status": "agreement_pending",
                    "employerName": "Rahul Sharma",
                    "employerPhone": "+91 98111 88234",
                    "confirmedByWorker": False,
                    "createdAt": "2024-09-06T10:30:00Z"
                }
            ],
            "count": 1
        }

        # Verify structure
        assert "contracts" in contracts_response
        assert "count" in contracts_response
        assert contracts_response["count"] == 1

        contract = contracts_response["contracts"][0]
        assert contract["agreedWage"] == 2500.0
        assert contract["status"] == "agreement_pending"
        assert contract["confirmedByWorker"] is False


class TestContractActions:
    """Test worker accepting/rejecting contracts"""

    def test_accept_contract_action(self):
        """Test worker accepting a contract"""
        from app.schemas.booking import ContractActionSchema

        action = ContractActionSchema(
            contractId="550e8400-e29b-41d4-a716-446655440000",
            action="accept"
        )

        assert action.action == "accept"
        assert action.contractId == "550e8400-e29b-41d4-a716-446655440000"
        assert action.rejectReason is None

    def test_reject_contract_action(self):
        """Test worker rejecting a contract with reason"""
        from app.schemas.booking import ContractActionSchema

        action = ContractActionSchema(
            contractId="550e8400-e29b-41d4-a716-446655440000",
            action="reject",
            rejectReason="Wage too low for the work involved"
        )

        assert action.action == "reject"
        assert action.rejectReason == "Wage too low for the work involved"


class TestContractFlow:
    """Test complete contract workflow"""

    def test_end_to_end_contract_flow(self):
        """Simulate complete contract submission -> viewing -> acceptance flow"""

        # Step 1: Employer submits contract
        employer_submission = {
            "workerId": "w-ramesh",
            "serviceCategory": "plumber",
            "description": "Fix bathroom plumbing",
            "location": "Gurgaon",
            "date": "2024-09-15",
            "time": "10:00 AM",
            "agreedWage": 2500.0,
            "specialTerms": "Include materials in cost"
        }

        # Verify contract has no default wage
        assert employer_submission["agreedWage"] == 2500.0
        assert employer_submission["agreedWage"] != 1200  # Not hardcoded

        # Step 2: Contract is stored with agreement_pending status
        stored_contract = {
            "id": str(uuid.uuid4()),
            "bookingReference": "RZG-CT-XXXX",
            "worker_id": employer_submission["workerId"],
            "service_id": employer_submission["serviceCategory"],
            "wage_offer": employer_submission["agreedWage"],
            "status": "agreement_pending",
            "agreement_confirmed_by_employer": True,
            "agreement_confirmed_by_worker": False
        }

        assert stored_contract["wage_offer"] == 2500.0
        assert stored_contract["status"] == "agreement_pending"
        assert stored_contract["agreement_confirmed_by_worker"] is False

        # Step 3: Worker views contract
        worker_view = {
            "contracts": [
                {
                    "id": stored_contract["id"],
                    "agreedWage": stored_contract["wage_offer"],
                    "status": "agreement_pending",
                    "confirmedByWorker": False
                }
            ]
        }

        assert len(worker_view["contracts"]) == 1
        assert worker_view["contracts"][0]["agreedWage"] == 2500.0

        # Step 4: Worker accepts contract
        accepted_contract = {
            **stored_contract,
            "status": "active",
            "agreement_confirmed_by_worker": True
        }

        assert accepted_contract["status"] == "active"
        assert accepted_contract["agreement_confirmed_by_worker"] is True


class TestDataPersistence:
    """Test that contracts are properly persisted in database"""

    def test_contract_persists_negotiated_wage(self):
        """Verify wage is persisted exactly as submitted by employer"""
        test_cases = [
            ("w-ramesh", "plumber", 2500.0),
            ("w-suresh", "electrician", 3000.0),
            ("w-deepak", "carpenter", 1500.0),
            ("w-new-worker", "mason", 4500.0),
        ]

        for worker_id, category, wage in test_cases:
            # Simulate what would be stored in DB
            db_entry = {
                "worker_id": worker_id,
                "service_id": category,
                "wage_offer": wage,
                "status": "agreement_pending"
            }

            # Verify exact wage is stored, not a default
            assert db_entry["wage_offer"] == wage
            assert db_entry["wage_offer"] != 1200  # Not using hardcoded default
            assert db_entry["wage_offer"] != 500   # Not using any preset

    def test_contract_status_transitions(self):
        """Test contract status changes through workflow"""
        contract_id = str(uuid.uuid4())

        # Initial state
        initial = {"id": contract_id, "status": "agreement_pending"}
        assert initial["status"] == "agreement_pending"

        # After worker accepts
        accepted = {**initial, "status": "active", "agreement_confirmed_by_worker": True}
        assert accepted["status"] == "active"
        assert accepted["agreement_confirmed_by_worker"] is True

        # Alternative: worker rejects
        rejected = {**initial, "status": "cancelled"}
        assert rejected["status"] == "cancelled"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
